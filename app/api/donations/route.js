import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const donorEmail = searchParams.get("donorEmail");
    const recipientEmail = searchParams.get("recipientEmail");

    let where = {};

    if (donorEmail) {
      const donor = await prisma.user.findUnique({
        where: {
          email: donorEmail,
        },
      });

      if (!donor) {
        return NextResponse.json([]);
      }

      where.donorId = donor.id;
    }

    if (recipientEmail) {
      const recipient = await prisma.user.findUnique({
        where: {
          email: recipientEmail,
        },
      });

      if (!recipient) {
        return NextResponse.json([]);
      }

      where.recipientId = recipient.id;
    }

    const donations = await prisma.donation.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(donations);
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

    let donor = null;

    if (body.donorEmail) {
      donor = await prisma.user.findUnique({
        where: {
          email: body.donorEmail,
        },
      });
    }

    const recipient = await prisma.user.findUnique({
      where: {
        email: body.recipientEmail,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        {
          error: "Recipient not found",
        },
        {
          status: 404,
        }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        amount: Number(body.amount),
        message: body.message,
        anonymous: !donor,
        donorName:
          donor?.name ||
          donor?.username ||
          body.donorName ||
          "Anonymous",
        donorId: donor?.id,
        recipientId: recipient.id,
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

    // Recipient activity
    await prisma.activity.create({
      data: {
        userId: recipient.id,
        type: "DONATION_RECEIVED",
        data: {
          amount: Number(body.amount),
          donorName:
            donor?.name ||
            donor?.username ||
            body.donorName ||
            "Anonymous",
          donorEmail: donor?.email || null,
          anonymous: !donor,
          message: body.message,
        },
      },
    });

    // Donor activity (only for logged-in users)
    if (donor) {
      await prisma.activity.create({
        data: {
          userId: donor.id,
          type: "DONATION_SENT",
          data: {
            amount: Number(body.amount),
            recipientUsername: recipient.username,
            recipientEmail: recipient.email,
            message: body.message,
          },
        },
      });
    }

    return NextResponse.json(donation, {
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