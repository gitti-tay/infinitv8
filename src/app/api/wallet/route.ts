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

    const [user, walletBalances, recentTransactions, settings] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            walletAddress: true,
            kycStatus: true,
          },
        }),
        prisma.walletBalance.findMany({
          where: { userId },
        }),
        prisma.transaction.findMany({
          where: {
            userId,
            type: { in: ["DEPOSIT", "WITHDRAWAL", "TRANSFER"] },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.userSettings.findUnique({
          where: { userId },
          select: {
            biometricAuth: true,
            withdrawalWhitelist: true,
            emailConfirmWithdraw: true,
          },
        }),
      ]);

    const balances = walletBalances.map((wb) => ({
      id: wb.id,
      asset: wb.asset,
      network: wb.network,
      balance: Number(wb.balance),
      available: Number(wb.available),
    }));

    const transactions = recentTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      asset: tx.asset,
      amount: Number(tx.amount),
      status: tx.status,
      txHash: tx.txHash,
      description: tx.description,
      createdAt: tx.createdAt.toISOString(),
    }));

    return NextResponse.json({
      walletAddress: user?.walletAddress ?? null,
      kycStatus: user?.kycStatus ?? "NONE",
      balances,
      securitySettings: settings ?? {
        biometricAuth: false,
        withdrawalWhitelist: false,
        emailConfirmWithdraw: true,
      },
      recentTransactions: transactions,
    });
  } catch (error) {
    logger.error({ err: error }, "Wallet fetch failed");
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}
