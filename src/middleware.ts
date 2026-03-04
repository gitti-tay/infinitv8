import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/projects");

  // API routes: return 401 JSON instead of HTML redirect
  if (
    pathname.startsWith("/api/") &&
    !isPublicPage &&
    !pathname.startsWith("/api/health") &&
    !pathname.startsWith("/api/kyc/webhook") &&
    !isLoggedIn
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (!isPublicPage && !isAuthPage && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/health|api/kyc/webhook).*)"],
};
