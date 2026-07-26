/**
 * Supabase clients expect the project URL, for example:
 *   https://project-ref.supabase.co
 *
 * Operators sometimes paste the REST endpoint instead. Keeping this small
 * normalization at the boundary prevents the Auth client from constructing
 * `/rest/v1/auth/v1/...` URLs while still allowing the environment validator
 * to reject genuinely malformed URLs.
 */
export function normalizeSupabaseUrl(value: string): string {
  const url = new URL(value);

  if (url.pathname === "/rest/v1" || url.pathname === "/rest/v1/") {
    url.pathname = "";
  }

  return url.toString().replace(/\/$/, "");
}
