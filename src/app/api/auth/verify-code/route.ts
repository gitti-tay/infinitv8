import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { authLimiter, checkRateLimit, getIdentifier } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await checkRateLimit(authLimiter, getIdentifier(request));
    if (rateLimitResponse) return rateLimitResponse;

    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const record = await prisma.verificationCode.findFirst({
      where: { email, code, verified: false },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      await prisma.verificationCode.delete({ where: { id: record.id } });
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Mark code as used and verify user's email
    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: record.id },
        data: { verified: true },
      }),
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (error) {
    logger.error({ err: error }, "Failed to verify code");
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
