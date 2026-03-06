import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { authLimiter, checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { generateVerificationCode, sendVerificationCode } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await checkRateLimit(authLimiter, getIdentifier(request));
    if (rateLimitResponse) return rateLimitResponse;

    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: "If an account exists, a code has been sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified." });
    }

    // Delete any existing codes for this email
    await prisma.verificationCode.deleteMany({ where: { email } });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationCode.create({
      data: { email, code, expiresAt },
    });

    await sendVerificationCode(email, code);

    return NextResponse.json({ message: "Verification code sent." });
  } catch (error) {
    logger.error({ err: error }, "Failed to send verification code");
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
