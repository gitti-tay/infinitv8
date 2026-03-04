import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || undefined;
    const adminId = searchParams.get("adminId") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        include: {
          admin: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    const data = logs.map((log) => ({
      id: log.id,
      adminId: log.adminId,
      adminName: log.admin.name,
      adminEmail: log.admin.email,
      action: log.action,
      target: log.target,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      logs: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Admin: Failed to fetch audit logs");
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
