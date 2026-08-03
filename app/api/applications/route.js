import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POINT_VALUES } from "@/utils/pointsSystem";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const bountyId = searchParams.get("bountyId");
    const applicantEmail = searchParams.get("applicantEmail");
    const posterEmail = searchParams.get("posterEmail");

    const where = {};

    if (bountyId) {
      where.bountyId = bountyId;
    }

    if (applicantEmail) {
      where.applicant = {
        email: applicantEmail,
      };
    }

    if (posterEmail) {
      where.bounty = {
        poster: {
          email: posterEmail,
        },
      };
    }

    const applications = await prisma.bountyApplication.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
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

export async function POST(request) {
  try {
    const body = await request.json();

    const applicant = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!applicant) {
      return NextResponse.json(
        {
          error: "Applicant not found",
        },
        {
          status: 404,
        }
      );
    }

    const bounty = await prisma.bounty.findUnique({
      where: {
        id: body.bountyId,
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

    const existingApplication = await prisma.bountyApplication.findUnique({
      where: {
        bountyId_applicantId: {
          bountyId: bounty.id,
          applicantId: applicant.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          error: "You have already applied to this bounty.",
        },
        {
          status: 400,
        }
      );
    }

    const application = await prisma.$transaction(async (tx) => {
      const createdApplication = await tx.bountyApplication.create({
        data: {
          message: body.message || "",
          bountyId: bounty.id,
          applicantId: applicant.id,
        },
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

      await tx.user.update({
        where: {
          id: applicant.id,
        },
        data: {
          points: {
            increment: POINT_VALUES.BOUNTY_APPLICATION,
          },
        },
      });

      await tx.activity.create({
        data: {
          userId: applicant.id,
          type: "POINTS_AWARDED",
          data: {
            pointsAwarded: POINT_VALUES.BOUNTY_APPLICATION,
            reason: "Bounty Application",
            bountyId: bounty.id,
            bountyTitle: bounty.title,
          },
        },
      });

      return createdApplication;
    });

    return NextResponse.json(application, {
      status: 201,
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