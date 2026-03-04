import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { asset, amount, network, txHash } = body;

    // Validate required fields
    if (!asset || typeof asset !== "string") {
      return NextResponse.json(
        { error: "Asset is required" },
        { status: 400 }
      );
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    if (!network || typeof network !== "string") {
      return NextResponse.json(
        { error: "Network is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      // Create the deposit transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          asset,
          amount,
          status: "PENDING",
          txHash: txHash ?? null,
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
    logger.error({ err: error }, "Deposit failed");
    return NextResponse.json(
      { error: "Deposit failed" },
      { status: 500 }
    );
  }
}
