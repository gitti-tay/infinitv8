import crypto from "crypto";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { sumsubWebhookSchema } from "@/lib/validations/kyc";

const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;

function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!SUMSUB_SECRET_KEY) {
    logger.error("SUMSUB_SECRET_KEY is not configured — rejecting webhook");
    return false;
  }

  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", SUMSUB_SECRET_KEY);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

function mapReviewAnswer(answer: string) {
  switch (answer) {
    case "GREEN":
      return "APPROVED" as const;
    case "RED":
      return "REJECTED" as const;
    default:
      return "PENDING" as const;
  }
}

function mapEventToStatus(type: string) {
  switch (type) {
    case "applicantPending":
      return "PENDING" as const;
    default:
      return null;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = Buffer.from(await request.arrayBuffer());

    const signature = request.headers.get("x-payload-digest") || "";
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn("Invalid Sumsub webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsed = JSON.parse(rawBody.toString("utf-8"));
    const result = sumsubWebhookSchema.safeParse(parsed);
    if (!result.success) {
      logger.warn({ errors: result.error.flatten() }, "Invalid webhook payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { externalUserId, type, reviewResult, applicantId } = result.data;

    // Verify user exists before processing
    const user = await prisma.user.findUnique({
      where: { id: externalUserId },
    });

    if (!user) {
      logger.warn({ externalUserId }, "Webhook received for unknown user — acknowledging to stop retries");
      return NextResponse.json({ ok: true });
    }

    // Handle applicantReviewed — final status
    if (type === "applicantReviewed" && reviewResult) {
      const kycStatus = mapReviewAnswer(reviewResult.reviewAnswer);

      await prisma.$transaction([
        prisma.kycVerification.update({
          where: { userId: externalUserId },
          data: { status: kycStatus, sumsubApplicantId: applicantId },
        }),
        prisma.user.update({
          where: { id: externalUserId },
          data: { kycStatus },
        }),
      ]);

      logger.info({ userId: externalUserId, kycStatus }, "KYC webhook processed");
      return NextResponse.json({ ok: true });
    }

    // Handle intermediate events (applicantPending, etc.)
    const intermediateStatus = mapEventToStatus(type);
    if (intermediateStatus) {
      await prisma.$transaction([
        prisma.kycVerification.update({
          where: { userId: externalUserId },
          data: { status: intermediateStatus },
        }),
        prisma.user.update({
          where: { id: externalUserId },
          data: { kycStatus: intermediateStatus },
        }),
      ]);

      logger.info({ userId: externalUserId, type, status: intermediateStatus }, "KYC intermediate webhook processed");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "KYC webhook error");
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
