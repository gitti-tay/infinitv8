import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();

    if (typeof body.read !== "boolean") {
      return NextResponse.json(
        { error: "Field 'read' must be a boolean" },
        { status: 400 }
      );
    }

    // Verify ownership
    const notification = await prisma.notification.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: body.read },
    });

    return NextResponse.json({
      id: updated.id,
      type: updated.type,
      title: updated.title,
      message: updated.message,
      read: updated.read,
      data: updated.data,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, "Notification update failed");
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
