import { NextResponse } from "next/server";

import { auditLog, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const VALID_STATUS_TRANSITIONS = ["COMPLETED", "FAILED", "CANCELLED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    if (!VALID_STATUS_TRANSITIONS.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUS_TRANSITIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
      },
    });

    if (!existingTx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (existingTx.status !== "PENDING") {
      return NextResponse.json(
        { error: `Cannot update transaction with status ${existingTx.status}. Only PENDING transactions can be updated.` },
        { status: 400 }
      );
    }

    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: { status },
    });

    await auditLog(adminResult.userId, "UPDATE_TRANSACTION", id, {
      previousStatus: existingTx.status,
      newStatus: status,
      type: existingTx.type,
      amount: Number(existingTx.amount),
      userEmail: existingTx.user.email,
    });

    return NextResponse.json({
      id: updatedTx.id,
      type: updatedTx.type,
      amount: Number(updatedTx.amount),
      status: updatedTx.status,
      updatedAt: updatedTx.updatedAt,
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to update transaction");
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
