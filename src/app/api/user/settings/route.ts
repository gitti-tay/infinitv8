import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_FIELDS = [
  "biometricAuth",
  "withdrawalWhitelist",
  "emailConfirmWithdraw",
  "antiPhishingCode",
  "notifyYield",
  "notifyInvestment",
  "notifySystem",
  "theme",
] as const;

const BOOLEAN_FIELDS = new Set([
  "biometricAuth",
  "withdrawalWhitelist",
  "emailConfirmWithdraw",
  "notifyYield",
  "notifyInvestment",
  "notifySystem",
]);

const STRING_FIELDS = new Set(["antiPhishingCode", "theme"]);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Get or create default settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });

    return NextResponse.json({
      biometricAuth: settings.biometricAuth,
      withdrawalWhitelist: settings.withdrawalWhitelist,
      emailConfirmWithdraw: settings.emailConfirmWithdraw,
      antiPhishingCode: settings.antiPhishingCode,
      notifyYield: settings.notifyYield,
      notifyInvestment: settings.notifyInvestment,
      notifySystem: settings.notifySystem,
      theme: settings.theme,
    });
  } catch (error) {
    logger.error({ err: error }, "Settings fetch failed");
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(apiLimiter, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();

    // Validate and extract only allowed fields
    const data: Record<string, boolean | string | null> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        const value = body[key];

        if (BOOLEAN_FIELDS.has(key)) {
          if (typeof value !== "boolean") {
            return NextResponse.json(
              { error: `Field '${key}' must be a boolean` },
              { status: 400 }
            );
          }
          data[key] = value;
        }

        if (STRING_FIELDS.has(key)) {
          if (value !== null && typeof value !== "string") {
            return NextResponse.json(
              { error: `Field '${key}' must be a string or null` },
              { status: 400 }
            );
          }
          if (key === "theme" && value !== null && !["dark", "light"].includes(value)) {
            return NextResponse.json(
              { error: "Theme must be 'dark' or 'light'" },
              { status: 400 }
            );
          }
          if (key === "antiPhishingCode" && typeof value === "string" && value.length > 20) {
            return NextResponse.json(
              { error: "Anti-phishing code must be 20 characters or fewer" },
              { status: 400 }
            );
          }
          data[key] = value;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...data },
      update: data,
    });

    return NextResponse.json({
      biometricAuth: settings.biometricAuth,
      withdrawalWhitelist: settings.withdrawalWhitelist,
      emailConfirmWithdraw: settings.emailConfirmWithdraw,
      antiPhishingCode: settings.antiPhishingCode,
      notifyYield: settings.notifyYield,
      notifyInvestment: settings.notifyInvestment,
      notifySystem: settings.notifySystem,
      theme: settings.theme,
    });
  } catch (error) {
    logger.error({ err: error }, "Settings update failed");
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
