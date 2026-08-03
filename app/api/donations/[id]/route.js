import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const donation = await prisma.donation.findUnique({
      where: {
        id,
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    if (!donation) {
      return NextResponse.json(
        {
          error: "Donation not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(donation);
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

    const donation = await prisma.donation.findUnique({
      where: {
        id,
      },
    });

    if (!donation) {
      return NextResponse.json(
        {
          error: "Donation not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.donation.delete({
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