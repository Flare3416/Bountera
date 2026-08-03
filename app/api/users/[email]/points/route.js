import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { email } = await params;

    const user = await prisma.user.findUnique({
      where: {
        email: decodeURIComponent(email),
      },
      select: {
        id: true,
        points: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: "HUNTER",
      },
      select: {
        id: true,
        points: true,
      },
      orderBy: {
        points: "desc",
      },
    });

    const rank =
      users.findIndex((u) => u.id === user.id) + 1 || null;

    return NextResponse.json({
      points: user.points,
      rank,
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