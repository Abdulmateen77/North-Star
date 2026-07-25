import { describe, expect, it, vi } from "vitest";

import { jsonResponse, withApiHandler } from "@/lib/http";
import { InMemoryRateLimiter } from "@/shared/security/rate-limiter";

function buildLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("rate limiting", () => {
  it("limits repeated requests within a fixed window and resets after expiry", () => {
    let now = 1_000;
    const limiter = new InMemoryRateLimiter(() => now);

    expect(limiter.consume({ key: "caregiver:tasks", limit: 2, windowMs: 1_000 })).toMatchObject({
      allowed: true,
      remaining: 1,
    });
    expect(limiter.consume({ key: "caregiver:tasks", limit: 2, windowMs: 1_000 })).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    expect(limiter.consume({ key: "caregiver:tasks", limit: 2, windowMs: 1_000 })).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterMs: 1_000,
    });

    now = 2_001;

    expect(limiter.consume({ key: "caregiver:tasks", limit: 2, windowMs: 1_000 })).toMatchObject({
      allowed: true,
      remaining: 1,
    });
  });

  it("withApiHandler returns a consistent 429 response when the route rate limit is exceeded", async () => {
    const logger = buildLogger();
    const limiter = new InMemoryRateLimiter(() => 1_000);
    const request = new Request("http://localhost/api/care-management/tasks", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.42" },
    });
    const options = {
      routeLogger: logger,
      rateLimiter: limiter,
      rateLimit: {
        key: "test-client:/api/care-management/tasks",
        limit: 1,
        windowMs: 1_000,
      },
    };

    const first = await withApiHandler(request, () => jsonResponse({ ok: true }), options);
    const second = await withApiHandler(request, () => jsonResponse({ ok: true }), options);

    await expect(first.json()).resolves.toEqual({ ok: true });
    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    await expect(second.json()).resolves.toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please retry later.",
        details: { retryAfterSeconds: 1 },
      },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "api.request.rejected",
      expect.objectContaining({ code: "RATE_LIMITED", statusCode: 429 }),
    );
  });
});
