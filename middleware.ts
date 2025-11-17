import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;

export function middleware(request: NextRequest) {
  // If no password is set, allow all requests
  if (!ACCESS_PASSWORD) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow access to login page and API routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for auth token cookie
  const authToken = request.cookies.get("auth_token");

  // If no token, redirect to login
  if (!authToken || !authToken.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
