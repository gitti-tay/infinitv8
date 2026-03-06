import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isPublicPage =
    pathname === "/" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/risk-disclosure" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/projects");

  // API routes: return 401 JSON instead of HTML redirect
  if (
    pathname.startsWith("/api/") &&
    !isPublicPage &&
    !pathname.startsWith("/api/health") &&
    !pathname.startsWith("/api/kyc/webhook") &&
    !pathname.startsWith("/api/token-metadata") &&
    !isLoggedIn
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Redirect logged-in users away from auth pages (except /auth/verify)
  if (isAuthPage && isLoggedIn && !pathname.startsWith("/auth/verify") && !pathname.startsWith("/auth/forgot-password")) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Admin routes: require authentication (role check is in the admin layout)
  if (isAdminRoute && !isLoggedIn) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/auth/signin", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  if (!isPublicPage && !isAuthPage && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/health|api/kyc/webhook).*)"],
};
