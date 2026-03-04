import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["INVESTOR", "ADMIN"];
const VALID_KYC_STATUSES = ["NONE", "PENDING", "APPROVED", "REJECTED"];

export async function GET(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const kycStatus = searchParams.get("kycStatus") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

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

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;

    const [users, total, totalUsers, verifiedUsers, pendingKyc] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          kycStatus: true,
          walletAddress: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.user.count({ where: { kycStatus: "PENDING" } }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalUsers,
        verifiedUsers,
        pendingKyc,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch users");
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
