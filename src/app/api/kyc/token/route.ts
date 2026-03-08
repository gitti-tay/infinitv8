import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, kycLimiter } from "@/lib/rate-limit";
import { createSession } from "@/lib/didit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(kycLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { kycVerification: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.kycStatus === "APPROVED") {
      return NextResponse.json({ error: "KYC already approved" }, { status: 400 });
    }

    // Build callback URL
    const headersList = await headers();
    const host = headersList.get("host") || "www.infinitv8.com";
    const proto = headersList.get("x-forwarded-proto") || "https";
    const callbackUrl = `${proto}://${host}/kyc/status`;

    // Create Didit verification session
    const diditSession = await createSession(user.id, callbackUrl);

    // Store session ID in database
    await prisma.$transaction([
      prisma.kycVerification.upsert({
        where: { userId: user.id },
        update: { providerSessionId: diditSession.session_id },
        create: {
          userId: user.id,
          providerSessionId: diditSession.session_id,
          status: "PENDING",
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { kycStatus: "PENDING" },
      }),
    ]);

    return NextResponse.json({
      verificationUrl: diditSession.verification_url,
      sessionId: diditSession.session_id,
    });
  } catch (error) {
    logger.error({ err: error }, "KYC session error");
    return NextResponse.json({ error: "Failed to create KYC session" }, { status: 500 });
  }
}
