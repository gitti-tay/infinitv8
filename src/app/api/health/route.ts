import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = { status: "ok" };

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.project.count();
    checks.db = "ok";
  } catch {
    checks.db = "error";
  }

  // Env var presence check (values NOT exposed)
  const gid = process.env.GOOGLE_CLIENT_ID || "";
  checks.GOOGLE_CLIENT_ID = gid
    ? `set (len=${gid.length}, ends=${gid.slice(-30)})`
    : "missing";
  checks.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    ? `set (len=${process.env.GOOGLE_CLIENT_SECRET.length})`
    : "missing";
  checks.NEXTAUTH_SECRET = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) ? "set" : "missing";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "not set";
  checks.AUTH_URL = process.env.AUTH_URL || "not set";
  checks.RESEND_API_KEY = process.env.RESEND_API_KEY ? "set" : "missing";

  return NextResponse.json(checks);
}
