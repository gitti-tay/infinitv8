import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimitStrict } from "@/lib/rate-limit";

const ALLOWED_ASSETS = ["USDC", "USDT", "ETH"] as const;
const ALLOWED_NETWORKS = ["base"] as const;
const MAX_PER_TX = 50_000;
const DAILY_LIMIT = 100_000;
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimitStrict(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { asset, amount, toAddress, network } = body;

    // Validate asset whitelist
    if (!asset || !(ALLOWED_ASSETS as readonly string[]).includes(asset)) {
      return NextResponse.json(
        { error: `Asset must be one of: ${ALLOWED_ASSETS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate network whitelist
    if (!network || !(ALLOWED_NETWORKS as readonly string[]).includes(network)) {
      return NextResponse.json(
        { error: `Network must be one of: ${ALLOWED_NETWORKS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    if (amount > MAX_PER_TX) {
      return NextResponse.json(
        { error: `Maximum withdrawal per transaction is $${MAX_PER_TX.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!toAddress || typeof toAddress !== "string" || !ETH_ADDRESS_REGEX.test(toAddress)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      // KYC check inside transaction (prevent TOCTOU)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          kycStatus: true,
          walletAddress: true,
          settings: { select: { withdrawalWhitelist: true } },
        },
      });

      if (user?.kycStatus !== "APPROVED") {
        throw new Error("KYC_REQUIRED");
      }

      // Enforce withdrawal whitelist if enabled
      if (user.settings?.withdrawalWhitelist) {
        if (!user.walletAddress || user.walletAddress.toLowerCase() !== toAddress.toLowerCase()) {
          throw new Error("ADDRESS_NOT_WHITELISTED");
        }
      }

      // Check daily withdrawal limit
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const dailyWithdrawals = await tx.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: "WITHDRAWAL",
          status: { in: ["PENDING", "COMPLETED"] },
          createdAt: { gte: startOfDay },
        },
      });
      const todayTotal = Number(dailyWithdrawals._sum.amount ?? 0);
      if (todayTotal + amount > DAILY_LIMIT) {
        throw new Error(`DAILY_LIMIT:${DAILY_LIMIT - todayTotal}`);
      }

      // Check sufficient available balance
      const walletBalance = await tx.walletBalance.findUnique({
        where: {
          userId_asset_network: { userId, asset, network },
        },
      });

      if (!walletBalance || Number(walletBalance.available) < amount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // Decrement available balance (hold funds)
      await tx.walletBalance.update({
        where: {
          userId_asset_network: { userId, asset, network },
        },
        data: {
          available: { decrement: amount },
        },
      });

      // Create withdrawal transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "WITHDRAWAL",
          asset,
          amount,
          status: "PENDING",
          description: `Withdraw ${amount} ${asset} to ${toAddress} via ${network}`,
        },
      });

      return transaction;
    });

    return NextResponse.json(
      {
        id: result.id,
        type: result.type,
        asset: result.asset,
        amount: Number(result.amount),
        status: result.status,
        createdAt: result.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          { error: "Insufficient available balance" },
          { status: 400 }
        );
      }
      if (error.message === "KYC_REQUIRED") {
        return NextResponse.json(
          { error: "KYC verification required for withdrawals" },
          { status: 403 }
        );
      }
      if (error.message === "ADDRESS_NOT_WHITELISTED") {
        return NextResponse.json(
          { error: "Destination address not in your whitelist. Update your wallet address in Settings." },
          { status: 403 }
        );
      }
      if (error.message.startsWith("DAILY_LIMIT:")) {
        const remaining = error.message.split(":")[1];
        return NextResponse.json(
          { error: `Daily withdrawal limit reached. Remaining today: $${remaining}` },
          { status: 400 }
        );
      }
    }
    logger.error({ err: error }, "Withdrawal failed");
    return NextResponse.json(
      { error: "Withdrawal failed" },
      { status: 500 }
    );
  }
}
