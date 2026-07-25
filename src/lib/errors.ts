import { ZodError } from "zod";

export interface AppErrorOptions {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError({
    statusCode: 400,
    code: "BAD_REQUEST",
    message,
    details,
  });
}

export function unauthorized(message = "Authentication required."): AppError {
  return new AppError({
    statusCode: 401,
    code: "UNAUTHORIZED",
    message,
  });
}

export function forbidden(message = "Forbidden."): AppError {
  return new AppError({
    statusCode: 403,
    code: "FORBIDDEN",
    message,
  });
}

export function notFound(message = "Not found."): AppError {
  return new AppError({
    statusCode: 404,
    code: "NOT_FOUND",
    message,
  });
}

export function conflict(message = "Conflict.", details?: unknown): AppError {
  return new AppError({
    statusCode: 409,
    code: "CONFLICT",
    message,
    details,
  });
}

export function validationError(error: ZodError): AppError {
  return new AppError({
    statusCode: 400,
    code: "VALIDATION_ERROR",
    message: "Invalid request payload.",
    details: error.flatten(),
  });
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return validationError(error);
  }

  return new AppError({
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
  });
}
