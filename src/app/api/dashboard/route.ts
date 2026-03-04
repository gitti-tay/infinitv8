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

    // Fetch all data in parallel
    const [investments, walletBalances, yieldPayouts, recentTransactions, platformProjects] =
      await Promise.all([
        prisma.investment.findMany({
          where: { userId, status: "CONFIRMED" },
          include: { project: true },
        }),
        prisma.walletBalance.findMany({
          where: { userId },
        }),
        prisma.yieldPayout.findMany({
          where: { userId },
          include: { project: true },
          orderBy: { payoutDate: "desc" },
        }),
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.project.findMany({
          where: { status: "ACTIVE" },
        }),
      ]);

    // Calculate wallet totals
    const totalBalance = walletBalances.reduce(
      (sum, wb) => sum + Number(wb.balance),
      0
    );
    const availableBalance = walletBalances.reduce(
      (sum, wb) => sum + Number(wb.available),
      0
    );

    // Calculate investment totals
    const investedAmount = investments.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    );

    // Calculate yield totals
    const totalYieldEarned = yieldPayouts
      .filter((yp) => yp.paid)
      .reduce((sum, yp) => sum + Number(yp.amount), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyYield = yieldPayouts
      .filter((yp) => yp.paid && yp.paidAt && yp.paidAt >= startOfMonth)
      .reduce((sum, yp) => sum + Number(yp.amount), 0);

    // Calculate average APY from active investments
    const avgApy =
      investments.length > 0
        ? investments.reduce((sum, inv) => sum + Number(inv.project.apy), 0) /
          investments.length
        : 0;

    // Portfolio gain
    const portfolioGain = totalYieldEarned;
    const portfolioGainPct =
      investedAmount > 0 ? (totalYieldEarned / investedAmount) * 100 : 0;

    // Active investments with project details
    const activeInvestments = investments.map((inv) => {
      const yieldForInv = yieldPayouts
        .filter((yp) => yp.investmentId === inv.id && yp.paid)
        .reduce((sum, yp) => sum + Number(yp.amount), 0);

      const currentValue = Number(inv.amount) + yieldForInv;
      const gainPct =
        Number(inv.amount) > 0
          ? (yieldForInv / Number(inv.amount)) * 100
          : 0;

      // Maturity percentage based on term (months since investment vs project term)
      const monthsElapsed =
        (now.getTime() - inv.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const maturityPct = Math.min(
        (monthsElapsed / inv.project.term) * 100,
        100
      );

      return {
        id: inv.id,
        projectName: inv.project.name,
        ticker: inv.project.ticker,
        category: inv.project.category,
        amountInvested: Number(inv.amount),
        currentValue,
        gainPct: Math.round(gainPct * 100) / 100,
        apy: Number(inv.project.apy),
        maturityPct: Math.round(maturityPct * 100) / 100,
      };
    });

    // Upcoming payouts (unpaid, future date)
    const upcomingPayouts = yieldPayouts
      .filter((yp) => !yp.paid && yp.payoutDate >= now)
      .sort((a, b) => a.payoutDate.getTime() - b.payoutDate.getTime())
      .slice(0, 5)
      .map((yp) => ({
        id: yp.id,
        projectName: yp.project.name,
        ticker: yp.project.ticker,
        amount: Number(yp.amount),
        payoutDate: yp.payoutDate.toISOString(),
      }));

    // Recent activity from transactions
    const recentActivity = recentTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      asset: tx.asset,
      amount: Number(tx.amount),
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    }));

    // Platform-wide stats
    const tvl = platformProjects.reduce(
      (sum, p) =>
        sum + Number(p.targetAmount) * (Number(p.raisedPercent) / 100),
      0
    );
    const totalInvestorsResult = await prisma.investment.groupBy({
      by: ["userId"],
      where: { status: "CONFIRMED" },
    });
    const yieldDistributed = await prisma.yieldPayout.aggregate({
      _sum: { amount: true },
      where: { paid: true },
    });

    const platformStats = {
      tvl: Math.round(tvl),
      activeProjects: platformProjects.length,
      totalInvestors: totalInvestorsResult.length,
      yieldDistributed: Number(yieldDistributed._sum.amount ?? 0),
    };

    return NextResponse.json({
      totalBalance,
      availableBalance,
      investedAmount,
      totalYieldEarned,
      monthlyYield,
      avgApy: Math.round(avgApy * 100) / 100,
      portfolioGain,
      portfolioGainPct: Math.round(portfolioGainPct * 100) / 100,
      activeInvestments,
      upcomingPayouts,
      recentActivity,
      platformStats,
    });
  } catch (error) {
    logger.error({ err: error }, "Dashboard fetch failed");
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
