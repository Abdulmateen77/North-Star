import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { withApiHandler } from "@/lib/http";

describe("API error handling", () => {
  it("serializes expected application errors without leaking stack traces", async () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const request = new Request("http://localhost/api/test");

    const response = await withApiHandler(
      request,
      async () => {
        throw new AppError({
          statusCode: 404,
          code: "NOT_FOUND",
          message: "Care space not found",
        });
      },
      logger,
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Care space not found",
      },
    });
    expect(response.status).toBe(404);
  });

  it("logs and masks unexpected errors as internal server errors", async () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const request = new Request("http://localhost/api/test");

    const response = await withApiHandler(
      request,
      async () => {
        throw new Error("database password leaked in stack");
      },
      logger,
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });
    expect(response.status).toBe(500);
    expect(logger.error).toHaveBeenCalled();
  });
});
