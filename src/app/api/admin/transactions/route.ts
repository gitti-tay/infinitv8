import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["DEPOSIT", "WITHDRAWAL", "INVESTMENT", "YIELD", "TRANSFER", "FEE"];
const VALID_STATUSES = ["PENDING", "COMPLETED", "FAILED", "CANCELLED"];

export async function GET(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { name: true, ticker: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    const data = transactions.map((tx) => ({
      id: tx.id,
      userId: tx.userId,
      userName: tx.user.name,
      userEmail: tx.user.email,
      type: tx.type,
      asset: tx.asset,
      amount: Number(tx.amount),
      status: tx.status,
      txHash: tx.txHash,
      projectName: tx.project?.name ?? null,
      projectTicker: tx.project?.ticker ?? null,
      description: tx.description,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));

    return NextResponse.json({
      transactions: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch transactions");
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
