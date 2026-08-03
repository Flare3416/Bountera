import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POINT_VALUES } from "@/utils/pointsSystem";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const application = await prisma.bountyApplication.findUnique({
      where: { id },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            profileImage: true,
            points: true,
          },
        },
        bounty: {
          include: {
            poster: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingApplication = await prisma.bountyApplication.findUnique({
      where: { id },
      include: {
        applicant: true,
        bounty: true,
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const data = {};

    if (body.message !== undefined) {
      data.message = body.message;
    }

    if (body.status !== undefined) {
      data.status = body.status;
    }

    if (body.submittedWork !== undefined) {
      data.submittedWork = body.submittedWork;
    }

    if (body.submissionFiles !== undefined) {
      data.submissionFiles = body.submissionFiles;
    }

    if (body.rejectionReason !== undefined) {
      data.rejectionReason = body.rejectionReason;
    }

    const now = new Date();

    switch (body.status) {
      case "ACCEPTED":
        data.acceptedAt = now;
        break;

      case "SUBMITTED":
        data.submittedAt = now;
        break;

      case "COMPLETED":
        data.completedAt = now;
        break;

      case "REJECTED":
        data.rejectedAt = now;
        break;
    }

    const application = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.bountyApplication.update({
        where: {
          id,
        },
        data,
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              profileImage: true,
              points: true,
            },
          },
          bounty: {
            include: {
              poster: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  companyName: true,
                },
              },
            },
          },
        },
      });

      if (
        body.status === "COMPLETED" &&
        existingApplication.status !== "COMPLETED"
      ) {
        await tx.bounty.update({
          where: {
            id: existingApplication.bountyId,
          },
          data: {
            status: "COMPLETED",
          },
        });

        await tx.user.update({
          where: {
            id: existingApplication.applicantId,
          },
          data: {
            points: {
              increment: POINT_VALUES.BOUNTY_COMPLETION,
            },
          },
        });

        await tx.activity.create({
          data: {
            userId: existingApplication.applicantId,
            type: "POINTS_AWARDED",
            data: {
              pointsAwarded: POINT_VALUES.BOUNTY_COMPLETION,
              reason: "Bounty Completed",
              bountyId: existingApplication.bountyId,
              bountyTitle: existingApplication.bounty.title,
            },
          },
        });
      }

      return updatedApplication;
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.bountyApplication.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}