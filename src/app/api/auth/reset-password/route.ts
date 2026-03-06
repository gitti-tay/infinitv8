import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { authLimiter, checkRateLimit, getIdentifier } from "@/lib/rate-limit";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await checkRateLimit(authLimiter, getIdentifier(request));
    if (rateLimitResponse) return rateLimitResponse;

    const { email, token, newPassword } = await request.json();
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password are required" },
        { status: 400 }
      );
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters with uppercase, lowercase, digit, and special character" },
        { status: 400 }
      );
    }

    const record = await prisma.verificationCode.findFirst({
      where: { email, code: token, verified: false },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      await prisma.verificationCode.delete({ where: { id: record.id } });
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: record.id },
        data: { verified: true },
      }),
      prisma.user.update({
        where: { email },
        data: { passwordHash },
      }),
    ]);

    return NextResponse.json({ message: "Password has been reset successfully." });
  } catch (error) {
    logger.error({ err: error }, "Password reset failed");
    return NextResponse.json(
      { error: "Password reset failed" },
      { status: 500 }
    );
  }
}
