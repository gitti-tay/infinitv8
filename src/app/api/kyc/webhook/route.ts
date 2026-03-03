import crypto from "crypto";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { sumsubWebhookSchema } from "@/lib/validations/kyc";

const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY || "";

function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
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

    if (type !== "applicantReviewed" || !reviewResult) {
      return NextResponse.json({ ok: true });
    }

    const kycStatus = mapReviewAnswer(reviewResult.reviewAnswer);

    await prisma.kycVerification.update({
      where: { userId: externalUserId },
      data: { status: kycStatus, sumsubApplicantId: applicantId },
    });

    await prisma.user.update({
      where: { id: externalUserId },
      data: { kycStatus },
    });

    logger.info({ userId: externalUserId, kycStatus }, "KYC webhook processed");
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "KYC webhook error");
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
