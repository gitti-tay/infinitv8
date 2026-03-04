import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const userId = session.user.id;

    const [investments, yieldPayouts] = await Promise.all([
      prisma.investment.findMany({
        where: { userId, status: "CONFIRMED" },
        include: { project: true },
      }),
      prisma.yieldPayout.findMany({
        where: { userId },
        include: { project: true },
        orderBy: { payoutDate: "desc" },
      }),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build asset list with yield data per investment
    const assets = investments.map((inv) => {
      const invYields = yieldPayouts.filter(
        (yp) => yp.investmentId === inv.id
      );
      const yieldEarned = invYields
        .filter((yp) => yp.paid)
        .reduce((sum, yp) => sum + Number(yp.amount), 0);
      const currentValue = Number(inv.amount) + yieldEarned;
      const gainPct =
        Number(inv.amount) > 0
          ? (yieldEarned / Number(inv.amount)) * 100
          : 0;

      const monthsElapsed =
        (now.getTime() - inv.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const maturityPct = Math.min(
        (monthsElapsed / inv.project.term) * 100,
        100
      );

      return {
        id: inv.id,
        investmentId: inv.id,
        projectName: inv.project.name,
        ticker: inv.project.ticker,
        category: inv.project.category,
        location: inv.project.location,
        amountInvested: Number(inv.amount),
        currentValue,
        gainPct: Math.round(gainPct * 100) / 100,
        apy: Number(inv.project.apy),
        yieldEarned,
        maturityPct: Math.round(maturityPct * 100) / 100,
        status: inv.status,
      };
    });

    // Totals
    const totalInvested = assets.reduce((sum, a) => sum + a.amountInvested, 0);
    const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalYieldEarned = assets.reduce((sum, a) => sum + a.yieldEarned, 0);

    const monthlyYield = yieldPayouts
      .filter((yp) => yp.paid && yp.paidAt && yp.paidAt >= startOfMonth)
      .reduce((sum, yp) => sum + Number(yp.amount), 0);

    const avgApy =
      investments.length > 0
        ? investments.reduce((sum, inv) => sum + Number(inv.project.apy), 0) /
          investments.length
        : 0;

    const unrealizedGain = totalValue - totalInvested;
    const projectedAnnualYield =
      totalInvested * (avgApy / 100);

    // Allocation by category
    const allocationMap = new Map<string, number>();
    for (const asset of assets) {
      const prev = allocationMap.get(asset.category) ?? 0;
      allocationMap.set(asset.category, prev + asset.currentValue);
    }
    const allocation = Array.from(allocationMap.entries()).map(
      ([category, value]) => ({
        category,
        value,
        percentage:
          totalValue > 0
            ? Math.round((value / totalValue) * 10000) / 100
            : 0,
      })
    );

    // Payout history (paid payouts)
    const payoutHistory = yieldPayouts
      .filter((yp) => yp.paid)
      .map((yp) => ({
        id: yp.id,
        date: (yp.paidAt ?? yp.payoutDate).toISOString(),
        projectName: yp.project.name,
        ticker: yp.project.ticker,
        amount: Number(yp.amount),
        status: yp.paid ? "COMPLETED" : "PENDING",
      }));

    return NextResponse.json({
      totalValue,
      totalInvested,
      totalYieldEarned,
      monthlyYield,
      avgApy: Math.round(avgApy * 100) / 100,
      unrealizedGain,
      projectedAnnualYield: Math.round(projectedAnnualYield * 100) / 100,
      assets,
      allocation,
      payoutHistory,
    });
  } catch (error) {
    logger.error({ err: error }, "Portfolio fetch failed");
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}
