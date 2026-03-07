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
  checks.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? "set" : "missing";
  checks.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ? "set" : "missing";
  checks.NEXTAUTH_SECRET = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) ? "set" : "missing";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "not set";
  checks.RESEND_API_KEY = process.env.RESEND_API_KEY ? "set" : "missing";

  return NextResponse.json(checks);
}
