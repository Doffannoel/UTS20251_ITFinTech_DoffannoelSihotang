import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = [
  "/login",
  "/login/admin",
  "/register",
  "/checkout",
  "/Homepage",
  "/home",
  "/",
  "/favicon.ico",
  "/_next",
  "/images",
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
];

// Helper: allow exact match or prefix match (for dynamic routes)
function isPublicPath(pathname: string) {
  return publicPaths.some((publicPath) => {
    return (
      pathname === publicPath || pathname.startsWith(publicPath + "/") // e.g., /products/nike -> match /products
    );
  });
}

// Admin protected paths
const adminPaths = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public pages and static files
  if (
    isPublicPath(pathname) ||
    pathname.includes(".") || // e.g., .css, .js, .png
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const userToken = request.cookies.get("user-token")?.value;
  const adminToken = request.cookies.get("admin-token")?.value;

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
    return NextResponse.next();
  }

  // If accessing root ("/") and already logged in, redirect ke Homepage
  if (pathname === "/") {
    if (userToken || adminToken) {
      return NextResponse.redirect(new URL("/Homepage", request.url));
    }
    return NextResponse.next(); // allow access to / (login page)
  }

  // If accessing any other protected route but not logged in
  if (!userToken && !adminToken) {
    const redirectUrl = new URL("/", request.url); // redirect ke login
    redirectUrl.searchParams.set("from", pathname); // save original target
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next(); // otherwise allow access
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
