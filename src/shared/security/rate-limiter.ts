import { AppError } from "@/lib/errors";

export interface RateLimitInput {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

export interface RateLimiter {
  consume(input: RateLimitInput): RateLimitResult;
}

type Bucket = {
  count: number;
  resetAt: number;
};

export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  consume(input: RateLimitInput): RateLimitResult {
    const now = this.now();
    const existing = this.buckets.get(input.key);
    const bucket =
      existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + input.windowMs };

    if (bucket.count >= input.limit) {
      this.buckets.set(input.key, bucket);
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
        retryAfterMs: Math.max(0, bucket.resetAt - now),
      };
    }

    bucket.count += 1;
    this.buckets.set(input.key, bucket);

    return {
      allowed: true,
      remaining: Math.max(0, input.limit - bucket.count),
      resetAt: bucket.resetAt,
      retryAfterMs: 0,
    };
  }

  clear(): void {
    this.buckets.clear();
  }
}

export const defaultRateLimiter = new InMemoryRateLimiter();

export function rateLimitExceeded(result: RateLimitResult): AppError {
  return new AppError({
    statusCode: 429,
    code: "RATE_LIMITED",
    message: "Too many requests. Please retry later.",
    details: {
      retryAfterSeconds: Math.max(1, Math.ceil(result.retryAfterMs / 1_000)),
    },
  });
}

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown-client"
  );
}

export function buildRequestRateLimitKey(request: Request, scope = "api"): string {
  const url = new URL(request.url);
  return `${scope}:${getClientIdentifier(request)}:${request.method}:${url.pathname}`;
}
