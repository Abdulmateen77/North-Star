/**
 * Thin client for the North Star API.
 *
 * Errors are normalised into ApiError so callers get the backend's own
 * `code`/`message` rather than a bare status.
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = init;
  const finalHeaders = new Headers(headers);

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
