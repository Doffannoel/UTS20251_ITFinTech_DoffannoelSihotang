import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = [
  "/login",
  "/login/admin",
  "/register",
  "/api/auth/login",
  "/api/auth/admin-login",
  "/api/auth/register",
  "/api/auth/verify-otp",
  "/api/seed",
  "/api/seed-admin",
  "/api/products",
  "/api/xendit/webhook",
  "/payment/success",
  "/payment/failed",
  "/_next",
  "/favicon.ico",
  "/images",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and API routes
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.includes(".") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const userToken = request.cookies.get("user-token")?.value;
  const adminToken = request.cookies.get("admin-token")?.value;

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    if (!adminToken) {
      // Redirect to admin login if no admin token
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
    return NextResponse.next();
  }

  // Handle root path - redirect to login if not authenticated
  if (pathname === "/") {
    if (!userToken && !adminToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // If user is logged in, redirect to Homepage
    return NextResponse.redirect(new URL("/Homepage", request.url));
  }

  // For all other protected routes (home, products, cart, checkout, etc.)
  // Check if user is logged in
  if (!userToken && !adminToken) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except excluded public assets & specific APIs
    "/((?!api/auth|api/xendit/webhook|api/products|api/seed|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
