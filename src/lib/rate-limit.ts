import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

// Limiter instances are created lazily at first use to avoid
// importing @upstash/* at build time (Nixpacks treats static
// imports as required Docker build secrets).

type Limiter = { limit: (id: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }> };

let _authLimiter: Limiter | null | undefined;
let _apiLimiter: Limiter | null | undefined;
let _kycLimiter: Limiter | null | undefined;

async function createLimiter(window: number, cap: number, prefix: string): Promise<Limiter | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cap, `${window} s`),
    prefix,
  });
}

async function getAuthLimiter() {
  if (_authLimiter === undefined) _authLimiter = await createLimiter(60, 5, "ratelimit:auth");
  return _authLimiter;
}
async function getApiLimiter() {
  if (_apiLimiter === undefined) _apiLimiter = await createLimiter(60, 20, "ratelimit:api");
  return _apiLimiter;
}
async function getKycLimiter() {
  if (_kycLimiter === undefined) _kycLimiter = await createLimiter(60, 3, "ratelimit:kyc");
  return _kycLimiter;
}

export { getAuthLimiter as authLimiter, getApiLimiter as apiLimiter, getKycLimiter as kycLimiter };

export function getIdentifier(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"
  );
}

/**
 * Non-strict rate limit check — allows request through when Redis is unavailable.
 * Use for read-only / non-financial routes (project listing, notifications, etc.).
 */
export async function checkRateLimit(
  limiterOrGetter: Limiter | null | (() => Promise<Limiter | null>),
  identifier: string
): Promise<NextResponse | null> {
  const limiter = typeof limiterOrGetter === "function" ? await limiterOrGetter() : limiterOrGetter;
  if (!limiter) return null;
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

/**
 * Strict rate limit check — blocks request when Redis is unavailable.
 * Use for financial routes (deposit, withdrawal, investment, yield).
 */
export async function checkRateLimitStrict(
  limiterOrGetter: Limiter | null | (() => Promise<Limiter | null>),
  identifier: string
): Promise<NextResponse | null> {
  const limiter = typeof limiterOrGetter === "function" ? await limiterOrGetter() : limiterOrGetter;
  if (!limiter) {
    logger.error("Rate limiter unavailable — blocking financial request (fail-closed)");
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
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
    logger.error({ err: error }, "Rate limit check failed — blocking financial request (fail-closed)");
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
