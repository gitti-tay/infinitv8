import { NextResponse } from "next/server";

import { auditLog, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        investments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        yieldPayouts: {
          orderBy: { createdAt: "desc" },
          take: 50,
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
      investments: project.investments.map((inv) => ({
        ...inv,
        amount: Number(inv.amount),
      })),
      transactions: project.transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      })),
      yieldPayouts: project.yieldPayouts.map((yp) => ({
        ...yp,
        amount: Number(yp.amount),
      })),
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch project detail");
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { id } = await params;
    const body = await request.json();

    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Build update data from allowed fields
    const allowedFields = [
      "name",
      "ticker",
      "description",
      "location",
      "category",
      "apy",
      "term",
      "riskLevel",
      "status",
      "targetAmount",
      "minInvestment",
      "imageUrl",
      "payout",
      "tagline",
      "investmentThesis",
      "keyHighlights",
      "termSheet",
      "payoutWaterfall",
      "diligenceItems",
      "faqs",
      "documents",
      "plans",
      "badge",
      "raisedPercent",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data,
    });

    await auditLog(adminResult.userId, "UPDATE_PROJECT", id, {
      changes: Object.keys(data),
      projectName: updatedProject.name,
    });

    return NextResponse.json({
      ...updatedProject,
      apy: Number(updatedProject.apy),
      raisedPercent: Number(updatedProject.raisedPercent),
      targetAmount: Number(updatedProject.targetAmount),
      minInvestment: Number(updatedProject.minInvestment),
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to update project");
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
