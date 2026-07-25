import type { z, ZodSchema, ZodTypeAny } from "zod";

import { badRequest } from "./errors";

export async function parseJsonBody<TSchema extends ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }

  return schema.parse(body);
}

export function validateParams<T>(params: unknown, schema: ZodSchema<T>): T {
  return schema.parse(params);
}

export async function resolveRouteParams<T>(
  params: T | Promise<T>,
): Promise<T> {
  return params instanceof Promise ? params : Promise.resolve(params);
}
