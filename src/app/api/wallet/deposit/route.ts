import { NextResponse } from "next/server";
import { isHash } from "viem";

import { auth } from "@/lib/auth";
import { publicClient } from "@/lib/contracts/client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimitStrict } from "@/lib/rate-limit";

const ALLOWED_ASSETS = ["USDC", "USDT", "ETH"] as const;
const ALLOWED_NETWORKS = ["base"] as const;
const MAX_DEPOSIT = 100_000;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimitStrict(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { asset, amount, network, txHash } = body;

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
    if (amount > MAX_DEPOSIT) {
      return NextResponse.json(
        { error: `Maximum deposit is $${MAX_DEPOSIT.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Require txHash
    if (!txHash || typeof txHash !== "string" || !isHash(txHash)) {
      return NextResponse.json(
        { error: "Valid transaction hash is required" },
        { status: 400 }
      );
    }

    // Verify on-chain transaction
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

    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      // Check txHash uniqueness inside transaction (prevent race condition)
      const existingTx = await tx.transaction.findFirst({ where: { txHash } });
      if (existingTx) {
        throw new Error("DUPLICATE_TX");
      }

      // Create the deposit transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          asset,
          amount,
          status: "COMPLETED",
          txHash,
          description: `Deposit ${amount} ${asset} via ${network}`,
        },
      });

      // Upsert wallet balance
      await tx.walletBalance.upsert({
        where: {
          userId_asset_network: { userId, asset, network },
        },
        create: {
          userId,
          asset,
          network,
          balance: amount,
          available: amount,
        },
        update: {
          balance: { increment: amount },
          available: { increment: amount },
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
        txHash: result.txHash,
        createdAt: result.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_TX") {
      return NextResponse.json(
        { error: "Transaction already recorded" },
        { status: 409 }
      );
    }
    logger.error({ err: error }, "Deposit failed");
    return NextResponse.json(
      { error: "Deposit failed" },
      { status: 500 }
    );
  }
}
