import { NextResponse } from "next/server";
import { getPublicUser } from "@/lib/services/userService";

export async function GET(request, { params }) {
  try {
    const { username } = await params;
    const decodedUsername = decodeURIComponent(username);

    const user = await getPublicUser({ username: decodedUsername });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
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
