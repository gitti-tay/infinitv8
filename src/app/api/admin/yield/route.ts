import { NextResponse } from "next/server";

import { auditLog, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;

    // Overall yield stats
    const allPayouts = await prisma.yieldPayout.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: { select: { id: true, name: true, ticker: true } },
      },
    });

    const totalDistributed = allPayouts
      .filter((p) => p.paid)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalPending = allPayouts
      .filter((p) => !p.paid)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Group by project
    const byProject: Record<
      string,
      { projectId: string; projectName: string; ticker: string; distributed: number; pending: number; payoutCount: number }
    > = {};

    for (const payout of allPayouts) {
      const pid = payout.projectId;
      if (!byProject[pid]) {
        byProject[pid] = {
          projectId: pid,
          projectName: payout.project.name,
          ticker: payout.project.ticker,
          distributed: 0,
          pending: 0,
          payoutCount: 0,
        };
      }
      byProject[pid].payoutCount += 1;
      if (payout.paid) {
        byProject[pid].distributed += Number(payout.amount);
      } else {
        byProject[pid].pending += Number(payout.amount);
      }
    }

    return NextResponse.json({
      totalDistributed,
      totalPending,
      totalPayouts: allPayouts.length,
      byProject: Object.values(byProject),
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch yield overview");
    return NextResponse.json(
      { error: "Failed to fetch yield overview" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        investments: {
          where: { status: "CONFIRMED" },
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.investments.length === 0) {
      return NextResponse.json(
        { error: "No confirmed investments found for this project" },
        { status: 400 }
      );
    }

    const apy = Number(project.apy);

    // Validate APY bounds
    if (apy <= 0 || apy > 100) {
      return NextResponse.json(
        { error: `Invalid APY value: ${apy}%. Must be between 0 and 100.` },
        { status: 400 }
      );
    }

    // Normalize payout date to first of current month for idempotency
    const now = new Date();
    const payoutDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check for existing payouts this period (idempotency guard)
    const existingPayout = await prisma.yieldPayout.findFirst({
      where: {
        projectId,
        payoutDate,
      },
    });

    if (existingPayout) {
      return NextResponse.json(
        { error: `Yield already distributed for ${project.name} for ${payoutDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}` },
        { status: 409 }
      );
    }

    let totalYieldDistributed = 0;
    let investorsProcessed = 0;

    // Process each confirmed investment
    for (const investment of project.investments) {
      const investmentAmount = Number(investment.amount);
      const monthlyYield = (investmentAmount * apy) / 100 / 12;

      if (monthlyYield <= 0) continue;

      await prisma.$transaction([
        // 1. Create YieldPayout record
        prisma.yieldPayout.create({
          data: {
            userId: investment.userId,
            projectId: project.id,
            investmentId: investment.id,
            amount: monthlyYield,
            payoutDate,
            paid: false,
          },
        }),
        // 2. Create Transaction record
        prisma.transaction.create({
          data: {
            userId: investment.userId,
            type: "YIELD",
            asset: project.ticker,
            amount: monthlyYield,
            status: "COMPLETED",
            projectId: project.id,
            description: `Monthly yield payout for ${project.name}`,
          },
        }),
        // 3. Update or create WalletBalance
        prisma.walletBalance.upsert({
          where: {
            userId_asset_network: {
              userId: investment.userId,
              asset: "USDT",
              network: "internal",
            },
          },
          update: {
            balance: { increment: monthlyYield },
            available: { increment: monthlyYield },
          },
          create: {
            userId: investment.userId,
            asset: "USDT",
            network: "internal",
            balance: monthlyYield,
            available: monthlyYield,
          },
        }),
        // 4. Create Notification
        prisma.notification.create({
          data: {
            userId: investment.userId,
            type: "YIELD_RECEIVED",
            title: "Yield Received",
            message: `You received $${monthlyYield.toFixed(2)} yield from ${project.name}`,
            data: {
              projectId: project.id,
              projectName: project.name,
              amount: monthlyYield,
              investmentId: investment.id,
            },
          },
        }),
      ]);

      totalYieldDistributed += monthlyYield;
      investorsProcessed += 1;
    }

    await auditLog(adminResult.userId, "YIELD_DISTRIBUTION", projectId, {
      projectName: project.name,
      totalYieldDistributed,
      investorsProcessed,
      apy,
      payoutDate: payoutDate.toISOString(),
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      projectName: project.name,
      totalYieldDistributed,
      investorsProcessed,
      payoutDate: payoutDate.toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to distribute yield");
    return NextResponse.json(
      { error: "Failed to distribute yield" },
      { status: 500 }
    );
  }
}
