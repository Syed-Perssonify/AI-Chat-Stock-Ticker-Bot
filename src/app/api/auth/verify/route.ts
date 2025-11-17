import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;

export async function GET() {
  try {
    if (!ACCESS_PASSWORD) {
      return NextResponse.json({ authenticated: true });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (token && token.value) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
