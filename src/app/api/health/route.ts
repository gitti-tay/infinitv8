import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ":***@");

  const checks: Record<string, string> = {
    status: "ok",
    DATABASE_URL_host: maskedUrl ? new URL(maskedUrl).host : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
    NODE_ENV: process.env.NODE_ENV ?? "MISSING",
  };

  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: dbUrl });
    const result = await pool.query("SELECT 1 as test");
    checks.pg_raw = "ok: " + JSON.stringify(result.rows[0]);
    await pool.end();
  } catch (e) {
    checks.pg_raw = "FAILED: " + (e instanceof Error ? e.message : String(e));
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.project.count();
    checks.prisma = "ok";
    checks.project_count = String(count);
  } catch (e) {
    checks.prisma = "FAILED";
    checks.prisma_error = e instanceof Error ? e.message + " | " + (e.stack?.slice(0, 500) ?? "") : String(e);
  }

  return NextResponse.json(checks);
}
