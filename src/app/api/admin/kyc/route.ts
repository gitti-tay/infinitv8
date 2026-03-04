import { NextResponse } from "next/server";

import { auditLog, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const VALID_KYC_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export async function GET(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    if (status && !VALID_KYC_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_KYC_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [queue, total, pending, approved, rejected] = await Promise.all([
      prisma.kycVerification.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.kycVerification.count({ where }),
      prisma.kycVerification.count({ where: { status: "PENDING" } }),
      prisma.kycVerification.count({ where: { status: "APPROVED" } }),
      prisma.kycVerification.count({ where: { status: "REJECTED" } }),
    ]);

    const items = queue.map((item) => ({
      id: item.id,
      userId: item.user.id,
      userName: item.user.name,
      userEmail: item.user.email,
      status: item.status,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      queue: items,
      stats: { pending, approved, rejected },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch KYC queue");
    return NextResponse.json(
      { error: "Failed to fetch KYC queue" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const body = await request.json();
    const { userId, status, reason } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: "userId and status are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const kyc = await prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (!kyc) {
      return NextResponse.json(
        { error: "KYC verification not found for this user" },
        { status: 404 }
      );
    }

    const [updatedKyc] = await prisma.$transaction([
      prisma.kycVerification.update({
        where: { userId },
        data: { status },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { kycStatus: status },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: "KYC_UPDATE",
          title: `KYC ${status === "APPROVED" ? "Approved" : "Rejected"}`,
          message:
            status === "APPROVED"
              ? "Your identity verification has been approved. You can now invest."
              : `Your identity verification has been rejected.${reason ? ` Reason: ${reason}` : ""}`,
        },
      }),
    ]);

    await auditLog(adminResult.userId, "KYC_REVIEW", userId, {
      newStatus: status,
      previousStatus: kyc.status,
      reason: reason || null,
    });

    return NextResponse.json({
      success: true,
      userId,
      status: updatedKyc.status,
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to update KYC status");
    return NextResponse.json(
      { error: "Failed to update KYC status" },
      { status: 500 }
    );
  }
}
