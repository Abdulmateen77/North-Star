import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Thin client for the North Star API.
 *
 * The backend authenticates every route with a Supabase access token in the
 * `Authorization` header (see src/services/auth.service.ts), so every call here
 * pulls the current session token first. Errors are normalised into ApiError so
 * callers get the backend's own `code`/`message` rather than a bare status.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True when the caller is not signed in, or the token has expired. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await getSupabaseBrowserClient().auth.getSession();
  return data.session?.access_token ?? null;
}

async function toApiError(response: Response): Promise<ApiError> {
  let code = "REQUEST_FAILED";
  let message = `Request failed with status ${response.status}`;
  let details: unknown;

  try {
    const body = await response.json();
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      details = body.error.details;
    }
  } catch {
    // Non-JSON error body — keep the status-derived defaults.
  }

  return new ApiError(response.status, code, message, details);
}

async function request<T>(
  path: string,
  init: RequestInit & { requireAuth?: boolean } = {},
): Promise<T> {
  const { requireAuth = true, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);

  if (requireAuth) {
    const token = await getAccessToken();
    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "You are not signed in.");
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (rest.body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(path, { ...rest, headers: finalHeaders });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
