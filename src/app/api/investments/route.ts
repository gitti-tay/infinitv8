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
    const { projectId, amount, txHash, asset, network } = result.data;

    const userId = session.user.id;

    // Check txHash not already recorded (prevent double-spending)
    if (txHash) {
      const existingTx = await prisma.transaction.findFirst({ where: { txHash } });
      if (existingTx) {
        return NextResponse.json({ error: "Transaction already recorded" }, { status: 409 });
      }
    }

    const investment = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error("NOT_FOUND");
      }

      if (project.status !== "ACTIVE") {
        throw new Error("NOT_ACTIVE");
      }

      if (amount < Number(project.minInvestment)) {
        throw new Error(`MIN_INVESTMENT:${Number(project.minInvestment)}`);
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (user?.kycStatus !== "APPROVED") {
        throw new Error("KYC_REQUIRED");
      }

      const inv = await tx.investment.create({
        data: {
          userId,
          projectId,
          amount,
          status: "CONFIRMED",
          txHash: txHash || null,
          asset: asset || null,
          network: network || null,
        },
      });

      // Create transaction record with on-chain hash
      if (txHash) {
        await tx.transaction.create({
          data: {
            userId,
            type: "INVESTMENT",
            asset: asset || "USDC",
            amount,
            status: "COMPLETED",
            txHash,
            projectId,
            description: `Investment in ${project.name}`,
          },
        });
      }

      // Update project raised percentage
      const totalRaised = await tx.investment.aggregate({
        _sum: { amount: true },
        where: { projectId, status: "CONFIRMED" },
      });
      const raisedPct = totalRaised._sum.amount
        ? (Number(totalRaised._sum.amount) / Number(project.targetAmount)) * 100
        : 0;
      await tx.project.update({
        where: { id: projectId },
        data: { raisedPercent: Math.min(raisedPct, 100) },
      });

      return inv;
    });

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      if (error.message === "NOT_ACTIVE") {
        return NextResponse.json({ error: "Project not accepting investments" }, { status: 400 });
      }
      if (error.message.startsWith("MIN_INVESTMENT:")) {
        const min = error.message.split(":")[1];
        return NextResponse.json({ error: `Minimum investment is $${min}` }, { status: 400 });
      }
      if (error.message === "KYC_REQUIRED") {
        return NextResponse.json({ error: "KYC verification required" }, { status: 403 });
      }
    }
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

    const rateLimitResponse = await checkRateLimit(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

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
