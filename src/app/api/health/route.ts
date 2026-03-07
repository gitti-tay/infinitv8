import { NextResponse } from "next/server";

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

  // Test Google OIDC discovery
  try {
    const res = await fetch("https://accounts.google.com/.well-known/openid-configuration");
    checks.google_discovery = res.ok ? "ok" : `failed: ${res.status}`;
  } catch (e) {
    checks.google_discovery = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test Google OAuth flow by simulating the sign-in request
  checks.deploy_version = "v7";
  try {
    const { handlers } = await import("@/lib/auth");
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.infinitv8.com";
    const testReq = new Request(
      `${baseUrl}/api/auth/signin/google`,
      { method: "GET", headers: { host: new URL(baseUrl).host } }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (handlers.GET as any)(testReq);
    const location = response.headers.get("location") || "";
    checks.google_oauth_test = {
      status: response.status,
      redirectsTo: location.startsWith("https://accounts.google.com")
        ? "google (ok)"
        : location.substring(0, 120),
    };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    checks.google_oauth_test = {
      error: err.name,
      message: err.message,
      stack: err.stack?.split("\n").slice(0, 8).join("\n"),
    };
  }

  return NextResponse.json(checks);
}
