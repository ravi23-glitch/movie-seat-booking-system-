import { NextRequest } from "next/server";
import { AppError } from "@/lib/errors";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  req: NextRequest,
  limit: number = 60,
  windowMs: number = 60 * 1000
): void {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw new AppError("Too many requests, please try again shortly", 429, {
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
    });
  }

  record.count += 1;
}
