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

  // Show last auth error captured by custom logger (from any real request)
  checks.deploy_version = "v10";
  try {
    const { getLastAuthError } = await import("@/lib/auth.config");
    checks.lastAuthError = getLastAuthError();
  } catch {
    checks.lastAuthError = "could not import";
  }

  return NextResponse.json(checks);
}
