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

// Admin only paths
const adminPaths = ["/admin"];

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

    // Verify admin token (you can add more validation here)
    // For now, just check if token exists
    return NextResponse.next();
  }

  // Handle root path - allow rendering login page if not authenticated
  if (pathname === "/") {
    if (userToken || adminToken) {
      // If user is logged in, redirect to Homepage
      return NextResponse.redirect(new URL("/Homepage", request.url));
    }
    // If not authenticated, allow rendering the login page
    return NextResponse.next();
  }

  // For all other protected routes (home, products, cart, checkout, etc.)
  // Check if user is logged in
  if (!userToken && !adminToken) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth/* (authentication endpoints)
     * - api/xendit/webhook (payment webhook)
     * - api/products (public product list)
     * - api/seed (seeding endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, etc.
     */
    "/((?!api/auth|api/xendit/webhook|api/products|api/seed|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
