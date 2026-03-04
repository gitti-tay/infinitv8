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
    const { asset, amount, toAddress, network } = body;

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
    if (!toAddress || typeof toAddress !== "string") {
      return NextResponse.json(
        { error: "Destination address is required" },
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

    // Check KYC status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    if (user?.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "KYC verification required for withdrawals" },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
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
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { error: "Insufficient available balance" },
        { status: 400 }
      );
    }
    logger.error({ err: error }, "Withdrawal failed");
    return NextResponse.json(
      { error: "Withdrawal failed" },
      { status: 500 }
    );
  }
}
