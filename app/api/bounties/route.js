import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const POSTER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  profileImage: true,
  companyName: true,
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const posterEmail = searchParams.get("posterEmail");

    const where = {};

    if (posterEmail) {
      where.poster = {
        email: posterEmail,
      };
    }

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        poster: {
          select: POSTER_SELECT,
        },
        // Only the applicant count is used by consumers of this endpoint.
        applications: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bounties);
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

    const poster = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!poster) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (poster.role !== "POSTER") {
      return NextResponse.json(
        {
          error: "Only bounty posters can create bounties.",
        },
        {
          status: 403,
        }
      );
    }

    const bounty = await prisma.bounty.create({
      data: {
        title: body.title,
        description: body.description,

        categories: body.categories || [],

        difficulty: body.difficulty,

        budget: Number(body.budget),

        deadline: new Date(body.deadline),

        contact: body.contact,

        deliverables: body.deliverables || null,
        additionalInfo: body.additionalInfo || null,

        referenceImages: body.referenceImages || [],

        posterId: poster.id,
      },
      include: {
        poster: {
          select: POSTER_SELECT,
        },
        applications: true,
      },
    });

    return NextResponse.json(bounty, {
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