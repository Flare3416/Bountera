import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACTIVITY_TYPES } from "@/utils/activityData";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const bounty = await prisma.bounty.findUnique({
      where: {
        id,
      },
      include: {
        poster: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            profileImage: true,
            companyName: true,
          },
        },
        applications: true,
      },
    });

    if (!bounty) {
      return NextResponse.json(
        {
          error: "Bounty not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(bounty);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingBounty = await prisma.bounty.findUnique({
      where: {
        id,
      },
    });

    if (!existingBounty) {
      return NextResponse.json(
        {
          error: "Bounty not found",
        },
        {
          status: 404,
        }
      );
    }

    const wasCompleted = existingBounty.status === "COMPLETED";

    const data = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.categories !== undefined) data.categories = body.categories;
    if (body.difficulty !== undefined) data.difficulty = body.difficulty;
    if (body.budget !== undefined) data.budget = Number(body.budget);
    if (body.deadline !== undefined)
      data.deadline = new Date(body.deadline);
    if (body.contact !== undefined) data.contact = body.contact;
    if (body.deliverables !== undefined)
      data.deliverables = body.deliverables;
    if (body.additionalInfo !== undefined)
      data.additionalInfo = body.additionalInfo;
    if (body.referenceImages !== undefined)
      data.referenceImages = body.referenceImages;
    if (body.status !== undefined) data.status = body.status;

    const bounty = await prisma.bounty.update({
      where: {
        id,
      },
      data,
      include: {
        poster: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            profileImage: true,
            companyName: true,
          },
        },
        applications: {
          include: {
            applicant: true,
          },
        },
      },
    });

    if (body.status !== "COMPLETED") {
      await prisma.activity.create({
        data: {
          userId: bounty.poster.id,
          type: ACTIVITY_TYPES.BOUNTY_UPDATED,
          data: {
            bountyId: bounty.id,
            bountyTitle: bounty.title,
            status: bounty.status,
          },
        },
      });
    }

    if (!wasCompleted && body.status === "COMPLETED") {
      const acceptedApplications = bounty.applications.filter(
        (app) => app.status === "ACCEPTED"
      );

      for (const application of acceptedApplications) {
        await prisma.bountyApplication.update({
          where: {
            id: application.id,
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        await prisma.user.update({
          where: {
            id: application.applicantId,
          },
          data: {
            points: {
              increment: 100,
            },
          },
        });

        await prisma.activity.create({
          data: {
            userId: application.applicantId,
            type: ACTIVITY_TYPES.BOUNTY_COMPLETED,
            data: {
              bountyId: bounty.id,
              bountyTitle: bounty.title,
              points: 100,
            },
          },
        });
      }
    }

    return NextResponse.json(bounty);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const bounty = await prisma.bounty.findUnique({
      where: {
        id,
      },
    });

    if (!bounty) {
      return NextResponse.json(
        {
          error: "Bounty not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.activity.create({
      data: {
        userId: bounty.posterId,
        type: ACTIVITY_TYPES.BOUNTY_DELETED,
        data: {
          bountyId: bounty.id,
          bountyTitle: bounty.title,
        },
      },
    });

    await prisma.bounty.delete({
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
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}