import { NextResponse } from "next/server";

import { toAppError } from "./errors";
import { logger, type Logger } from "./logger";

export type ApiHandler = () => Promise<Response> | Response;

export async function withApiHandler(
  request: Request,
  handler: ApiHandler,
  routeLogger: Logger = logger,
): Promise<Response> {
  const startedAt = Date.now();

  try {
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
