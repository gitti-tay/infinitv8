import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
    AUTH_URL: process.env.AUTH_URL ?? "MISSING",
    NODE_ENV: process.env.NODE_ENV ?? "MISSING",
  };

  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.project.count();
    checks.db_connection = "ok";
    checks.project_count = String(count);
  } catch (e) {
    checks.db_connection = "FAILED";
    checks.db_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(checks);
}
