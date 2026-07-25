import { NextResponse } from "next/server";

import { toAppError } from "./errors";
import { logger, type Logger } from "./logger";
import {
  buildRequestRateLimitKey,
  defaultRateLimiter,
  rateLimitExceeded,
  type RateLimiter,
} from "@/shared/security/rate-limiter";

export type ApiHandler = () => Promise<Response> | Response;

export interface ApiRateLimitConfig {
  key?: string;
  limit?: number;
  windowMs?: number;
}

export interface ApiHandlerOptions {
  routeLogger?: Logger;
  rateLimiter?: RateLimiter | null;
  rateLimit?: ApiRateLimitConfig | false;
}

type ApiHandlerConfig = Logger | ApiHandlerOptions;

const defaultMutationRateLimit: Required<Omit<ApiRateLimitConfig, "key">> = {
  limit: 120,
  windowMs: 60_000,
};

function isLogger(config: ApiHandlerConfig | undefined): config is Logger {
  return Boolean(
    config &&
      "info" in config &&
      "warn" in config &&
      "error" in config &&
      typeof config.info === "function",
  );
}

function resolveOptions(config: ApiHandlerConfig | undefined): Required<Pick<ApiHandlerOptions, "routeLogger">> & ApiHandlerOptions {
  if (!config) {
    return { routeLogger: logger };
  }

  if (isLogger(config)) {
    return { routeLogger: config };
  }

  return {
    routeLogger: config.routeLogger ?? logger,
    rateLimiter: config.rateLimiter,
    rateLimit: config.rateLimit,
  };
}

function shouldRateLimit(request: Request, options: ApiHandlerOptions): boolean {
  if (options.rateLimit === false || options.rateLimiter === null) {
    return false;
  }

  return !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase());
}

function enforceRateLimit(request: Request, options: ApiHandlerOptions): void {
  if (!shouldRateLimit(request, options)) {
    return;
  }

  const rateLimit = options.rateLimit === false ? undefined : options.rateLimit;
  const limiter = options.rateLimiter ?? defaultRateLimiter;
  const result = limiter.consume({
    key: rateLimit?.key ?? buildRequestRateLimitKey(request),
    limit: rateLimit?.limit ?? defaultMutationRateLimit.limit,
    windowMs: rateLimit?.windowMs ?? defaultMutationRateLimit.windowMs,
  });

  if (!result.allowed) {
    throw rateLimitExceeded(result);
  }
}

export async function withApiHandler(
  request: Request,
  handler: ApiHandler,
  config?: ApiHandlerConfig,
): Promise<Response> {
  const startedAt = Date.now();
  const options = resolveOptions(config);
  const routeLogger = options.routeLogger;

  try {
    enforceRateLimit(request, options);
    const response = await handler();

    routeLogger.info("api.request.completed", {
      method: request.method,
      path: new URL(request.url).pathname,
      statusCode: response.status,
      durationMs: Date.now() - startedAt,
    });

    return response;
  } catch (error) {
    const appError = toAppError(error);
    const statusCode = appError.statusCode;
    const logContext = {
      method: request.method,
      path: new URL(request.url).pathname,
      statusCode,
      code: appError.code,
      durationMs: Date.now() - startedAt,
      errorMessage: error instanceof Error ? error.message : String(error),
    };

    if (statusCode >= 500) {
      routeLogger.error("api.request.failed", logContext);
    } else {
      routeLogger.warn("api.request.rejected", logContext);
    }

    return NextResponse.json(
      {
        error: {
          code: appError.code,
          message: appError.message,
          ...(appError.details === undefined ? {} : { details: appError.details }),
        },
      },
      { status: statusCode },
    );
  }
}

export function jsonResponse<T>(body: T, status = 200): Response {
  return NextResponse.json(body, { status });
}

export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}
