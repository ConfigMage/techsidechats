import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, getSessionCookie, getLogoutCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    const cookie = getSessionCookie();
    response.cookies.set(cookie);

    return response;
  } catch {
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  const cookie = getLogoutCookie();
  response.cookies.set(cookie);
  return response;
}
