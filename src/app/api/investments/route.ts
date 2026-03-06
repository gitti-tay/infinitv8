import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { publicClient } from "@/lib/contracts/client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimit, checkRateLimitStrict } from "@/lib/rate-limit";
import { createInvestmentSchema } from "@/lib/validations/investment";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimitStrict(apiLimiter, session.user.id);
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

    // Verify on-chain transaction before recording
    let receipt;
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    } catch {
      return NextResponse.json(
        { error: "Transaction not found on-chain. It may still be pending." },
        { status: 400 }
      );
    }

    if (receipt.status !== "success") {
      return NextResponse.json(
        { error: "Transaction failed on-chain" },
        { status: 400 }
      );
    }

    const investment = await prisma.$transaction(async (tx) => {
      // Check txHash uniqueness INSIDE transaction (prevent race condition)
      const existingTx = await tx.transaction.findFirst({ where: { txHash } });
      if (existingTx) {
        throw new Error("DUPLICATE_TX");
      }

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

      // Check fundraising cap
      const totalRaised = await tx.investment.aggregate({
        _sum: { amount: true },
        where: { projectId, status: "CONFIRMED" },
      });
      const currentRaised = Number(totalRaised._sum.amount ?? 0);
      const targetAmount = Number(project.targetAmount);
      if (currentRaised + amount > targetAmount) {
        const remaining = targetAmount - currentRaised;
        throw new Error(`FUNDRAISING_CAP:${remaining}`);
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
          txHash,
          asset,
          network,
        },
      });

      // Create transaction record with on-chain hash
      await tx.transaction.create({
        data: {
          userId,
          type: "INVESTMENT",
          asset,
          amount,
          status: "COMPLETED",
          txHash,
          projectId,
          description: `Investment in ${project.name}`,
        },
      });

      // Update project raised percentage
      const raisedPct = ((currentRaised + amount) / targetAmount) * 100;
      await tx.project.update({
        where: { id: projectId },
        data: { raisedPercent: Math.min(raisedPct, 100) },
      });

      return inv;
    });

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DUPLICATE_TX") {
        return NextResponse.json({ error: "Transaction already recorded" }, { status: 409 });
      }
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
      if (error.message.startsWith("FUNDRAISING_CAP:")) {
        const remaining = error.message.split(":")[1];
        return NextResponse.json(
          { error: `Project fundraising cap reached. Maximum remaining: $${remaining}` },
          { status: 400 }
        );
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
