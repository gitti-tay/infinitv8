import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:auth",
});

export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix: "ratelimit:api",
});

export const kycLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  prefix: "ratelimit:kyc",
});

export function getIdentifier(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"
  );
}

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      logger.warn({ identifier, limit, remaining }, "Rate limit exceeded");
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }

    return null;
  } catch (error) {
    logger.error({ err: error }, "Rate limit check failed");
    return null;
  }
}
