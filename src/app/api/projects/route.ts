import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { projectQuerySchema } from "@/lib/validations/project";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
    };

    const result = projectQuerySchema.safeParse(query);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (result.data.category) where.category = result.data.category;
    if (result.data.status) where.status = result.data.status;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const serialized = projects.map((p) => ({
      ...p,
      apy: Number(p.apy),
      raisedPercent: Number(p.raisedPercent),
      targetAmount: Number(p.targetAmount),
      minInvestment: Number(p.minInvestment),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch projects");
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
