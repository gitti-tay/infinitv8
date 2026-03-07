import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, unknown> = { status: "ok" };

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.project.count();
    checks.db = "ok";
  } catch {
    checks.db = "error";
  }

  // Env var diagnostics
  const gid = process.env.GOOGLE_CLIENT_ID || "";
  const gsec = process.env.GOOGLE_CLIENT_SECRET || "";
  checks.google = {
    clientId: gid ? { len: gid.length, prefix: gid.slice(0, 10), suffix: gid.slice(-35) } : "missing",
    clientSecret: gsec ? { len: gsec.length, prefix: gsec.slice(0, 8) } : "missing",
  };
  checks.NEXTAUTH_SECRET = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) ? "set" : "missing";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "not set";
  checks.AUTH_URL = process.env.AUTH_URL || "not set";

  // Test Google OAuth flow and capture error via custom logger
  checks.deploy_version = "v9";
  try {
    const { handlers } = await import("@/lib/auth");
    const { getLastAuthError } = await import("@/lib/auth.config");
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.infinitv8.com";
    const testReq = new NextRequest(
      new URL("/api/auth/signin/google", baseUrl),
      { method: "GET", headers: { host: new URL(baseUrl).host } }
    );
    const response = await handlers.GET(testReq);
    const location = response.headers.get("location") || "";
    checks.google_oauth_test = {
      status: response.status,
      redirectsTo: location.startsWith("https://accounts.google.com")
        ? "google (ok)"
        : location.substring(0, 200),
      lastAuthError: getLastAuthError(),
    };
  } catch (e) {
    const { getLastAuthError } = await import("@/lib/auth.config");
    const err = e instanceof Error ? e : new Error(String(e));
    checks.google_oauth_test = {
      error: err.name,
      message: err.message,
      cause: err.cause ? String(err.cause) : undefined,
      lastAuthError: getLastAuthError(),
      stack: err.stack?.split("\n").slice(0, 8).join("\n"),
    };
  }

  return NextResponse.json(checks);
}
