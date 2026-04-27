import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only these pages need public access
const isPublicPage = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // ✅ CRITICAL: API routes must NEVER be redirected by middleware
  // Each API route handles its own auth and returns 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ✅ Static files pass through
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // ✅ Public pages — no auth needed
  if (isPublicPage(request)) {
    return NextResponse.next();
  }

  // ✅ Protected pages — redirect to sign-in if not logged in
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on all routes EXCEPT Next.js internals and static files
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};