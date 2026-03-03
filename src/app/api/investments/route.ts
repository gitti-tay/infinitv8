import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { createInvestmentSchema } from "@/lib/validations/investment";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const result = createInvestmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { projectId, amount } = result.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Project not accepting investments" },
        { status: 400 }
      );
    }

    if (amount < Number(project.minInvestment)) {
      return NextResponse.json(
        { error: `Minimum investment is $${Number(project.minInvestment)}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "KYC verification required" },
        { status: 403 }
      );
    }

    const investment = await prisma.investment.create({
      data: {
        userId: session.user.id,
        projectId,
        amount,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Investment failed");
    return NextResponse.json(
      { error: "Investment failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investments = await prisma.investment.findMany({
      where: { userId: session.user.id },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(investments);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch investments");
    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}
