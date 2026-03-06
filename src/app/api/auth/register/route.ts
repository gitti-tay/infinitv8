import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { generateVerificationCode, sendVerificationCode } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { authLimiter, checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await checkRateLimit(authLimiter, getIdentifier(request));
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    // Generate and send verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationCode.create({
      data: { email, code, expiresAt },
    });

    try {
      await sendVerificationCode(email, code);
    } catch (emailError) {
      logger.error({ err: emailError }, "Failed to send verification email");
      // Don't fail registration if email fails — user can resend from verify page
    }

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ err: error }, "Registration failed");
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
