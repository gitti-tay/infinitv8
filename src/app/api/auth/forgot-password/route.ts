import crypto from "crypto";

import { NextResponse } from "next/server";

import { sendPasswordResetEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { authLimiter, checkRateLimit, getIdentifier } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await checkRateLimit(authLimiter, getIdentifier(request));
    if (rateLimitResponse) return rateLimitResponse;

    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: "If an account exists, a password reset link has been sent.",
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      // No account or OAuth-only account — don't reveal this
      return successResponse;
    }

    // Delete any existing reset tokens for this email
    await prisma.verificationCode.deleteMany({ where: { email } });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.verificationCode.create({
      data: { email, code: token, expiresAt },
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch (emailError) {
      logger.error({ err: emailError }, "Failed to send password reset email");
    }

    return successResponse;
  } catch (error) {
    logger.error({ err: error }, "Password reset request failed");
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
