import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("simuphish_session");
  const { pathname } = request.nextUrl;

  // Allow static assets and Next.js internal calls
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If unauthenticated and attempting to access any route other than /login
  if (!session && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login, redirect to active chat
  if (session && pathname === "/login") {
    const chatUrl = new URL("/conv-1", request.url);
    return NextResponse.redirect(chatUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, favicon
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
