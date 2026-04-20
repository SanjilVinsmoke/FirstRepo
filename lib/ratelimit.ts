/**
 * Simple in-memory rate limiter using a sliding window.
 * Replace the store with Redis for multi-instance deployments.
 */
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import type { NextRequest } from "next/server";

const limiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX ?? "10"),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW ?? "60"),
});

export async function checkRateLimit(req: NextRequest): Promise<RateLimiterRes | null> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  try {
    await limiter.consume(ip);
    return null; // allowed
  } catch (err) {
    return err as RateLimiterRes; // blocked
  }
}
