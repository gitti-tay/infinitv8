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

  return NextResponse.json(checks);
}
