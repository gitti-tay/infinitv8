import crypto from "crypto";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { diditWebhookSchema } from "@/lib/validations/kyc";

const DIDIT_WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET;

function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!DIDIT_WEBHOOK_SECRET) {
    logger.error("DIDIT_WEBHOOK_SECRET is not configured — rejecting webhook");
    return false;
  }
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", DIDIT_WEBHOOK_SECRET);
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

function mapDiditStatus(status: string) {
  switch (status) {
    case "Approved":
      return "APPROVED" as const;
    case "Declined":
      return "REJECTED" as const;
    case "In Review":
      return "PENDING" as const;
    case "Abandoned":
      return "REJECTED" as const;
    default:
      return "PENDING" as const;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = Buffer.from(await request.arrayBuffer());

    const signature = request.headers.get("x-signature-v2") || "";
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn("Invalid Didit webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsed = JSON.parse(rawBody.toString("utf-8"));
    const result = diditWebhookSchema.safeParse(parsed);
    if (!result.success) {
      logger.warn({ errors: result.error.flatten() }, "Invalid webhook payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { session_id, status, vendor_data } = result.data;
    const userId = vendor_data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.warn({ userId }, "Webhook received for unknown user — acknowledging");
      return NextResponse.json({ ok: true });
    }

    const kycStatus = mapDiditStatus(status);

    await prisma.$transaction([
      prisma.kycVerification.update({
        where: { userId },
        data: { status: kycStatus, providerSessionId: session_id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { kycStatus },
      }),
    ]);

    logger.info({ userId, kycStatus, session_id }, "KYC webhook processed");
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "KYC webhook error");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
