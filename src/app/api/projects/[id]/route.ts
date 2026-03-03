import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { projectIdSchema } from "@/lib/validations/project";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = projectIdSchema.safeParse({ id });
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: result.data.id },
      include: {
        investments: {
          select: { id: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...project,
      apy: Number(project.apy),
      raisedPercent: Number(project.raisedPercent),
      targetAmount: Number(project.targetAmount),
      minInvestment: Number(project.minInvestment),
      investorCount: project.investments.length,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch project");
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
