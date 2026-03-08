import crypto from "crypto";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const DIDIT_WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET;

// Recursively sort object keys for canonical JSON (Didit V2 requirement)
function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortKeys((obj as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return obj;
}

// Convert whole-number floats to integers (Didit V2 requirement)
function shortenFloats(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(shortenFloats);
  } else if (data !== null && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        key,
        shortenFloats(value),
      ])
    );
  } else if (
    typeof data === "number" &&
    !Number.isInteger(data) &&
    data % 1 === 0
  ) {
    return Math.trunc(data);
  }
  return data;
}

function verifySignatureV2(
  jsonBody: unknown,
  signatureHeader: string,
  timestamp: string
): boolean {
  if (!DIDIT_WEBHOOK_SECRET || !signatureHeader || !timestamp) return false;

  // Validate timestamp freshness (5-minute window)
  const currentTime = Math.floor(Date.now() / 1000);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > 300) {
    logger.warn({ currentTime, incomingTime }, "Webhook timestamp outside 5-minute window");
    return false;
  }

  const processedData = shortenFloats(jsonBody);
  const canonicalJson = JSON.stringify(sortKeys(processedData));

  const hmac = crypto.createHmac("sha256", DIDIT_WEBHOOK_SECRET);
  const expectedSignature = hmac.update(canonicalJson, "utf8").digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signatureHeader, "utf8")
    );
  } catch {
    return false;
  }
}

function verifySignatureSimple(
  jsonBody: Record<string, unknown>,
  signatureHeader: string,
  timestamp: string
): boolean {
  if (!DIDIT_WEBHOOK_SECRET || !signatureHeader || !timestamp) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > 300) return false;

  const canonicalString = [
    (jsonBody.timestamp as string) || "",
    (jsonBody.session_id as string) || "",
    (jsonBody.status as string) || "",
    (jsonBody.webhook_type as string) || "",
  ].join(":");

  const hmac = crypto.createHmac("sha256", DIDIT_WEBHOOK_SECRET);
  const expectedSignature = hmac.update(canonicalString).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signatureHeader, "utf8")
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
    const parsed = JSON.parse(rawBody.toString("utf-8")) as Record<string, unknown>;

    const signatureV2 = request.headers.get("x-signature-v2") || "";
    const signatureSimple = request.headers.get("x-signature-simple") || "";
    const timestamp = request.headers.get("x-timestamp") || "";

    if (!DIDIT_WEBHOOK_SECRET) {
      logger.error("DIDIT_WEBHOOK_SECRET is not configured — rejecting webhook");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Try V2 first, fall back to Simple
    const v2Valid = signatureV2 && verifySignatureV2(parsed, signatureV2, timestamp);
    const simpleValid =
      !v2Valid && signatureSimple && verifySignatureSimple(parsed, signatureSimple, timestamp);

    if (!v2Valid && !simpleValid) {
      logger.warn("Invalid Didit webhook signature (tried V2 and Simple)");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const sessionId = parsed.session_id as string;
    const status = parsed.status as string;
    const vendorData = parsed.vendor_data as string;

    if (!sessionId || !status || !vendorData) {
      logger.warn({ parsed }, "Missing required webhook fields");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const userId = vendorData;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.warn({ userId }, "Webhook received for unknown user — acknowledging");
      return NextResponse.json({ ok: true });
    }

    const kycStatus = mapDiditStatus(status);

    await prisma.$transaction([
      prisma.kycVerification.update({
        where: { userId },
        data: { status: kycStatus, providerSessionId: sessionId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { kycStatus },
      }),
    ]);

    logger.info({ userId, kycStatus, sessionId }, "KYC webhook processed");
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "KYC webhook error");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
