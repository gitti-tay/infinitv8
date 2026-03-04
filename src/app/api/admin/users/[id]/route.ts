import { NextResponse } from "next/server";

import { auditLog, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["INVESTOR", "ADMIN"];
const VALID_KYC_STATUSES = ["NONE", "PENDING", "APPROVED", "REJECTED"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        investments: {
          include: {
            project: {
              select: { name: true, ticker: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        kycVerification: true,
        walletBalances: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { passwordHash: _pw, ...safeUser } = user;

    return NextResponse.json({
      ...safeUser,
      investments: safeUser.investments.map((inv) => ({
        ...inv,
        amount: Number(inv.amount),
      })),
      transactions: safeUser.transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      })),
      walletBalances: safeUser.walletBalances.map((wb) => ({
        ...wb,
        balance: Number(wb.balance),
        available: Number(wb.available),
      })),
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch user detail");
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { id } = await params;
    const body = await request.json();
    const { role, kycStatus } = body;

    if (!role && !kycStatus) {
      return NextResponse.json(
        { error: "Must provide role or kycStatus to update" },
        { status: 400 }
      );
    }

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (kycStatus && !VALID_KYC_STATUSES.includes(kycStatus)) {
      return NextResponse.json(
        { error: `Invalid kycStatus. Must be one of: ${VALID_KYC_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (role) data.role = role;
    if (kycStatus) data.kycStatus = kycStatus;

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        kycStatus: true,
      },
    });

    await auditLog(adminResult.userId, "UPDATE_USER", id, {
      changes: data,
      previousRole: existingUser.role,
      previousKycStatus: existingUser.kycStatus,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to update user");
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
