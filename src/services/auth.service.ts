import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import type { User } from "@/domain/models";
import { unauthorized } from "@/lib/errors";
import {
  createSupabaseServerClient,
  type SupabaseAdminClient,
} from "@/lib/supabase/server";

export function getBearerToken(request: Request): string {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw unauthorized();
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw unauthorized();
  }

  return token;
}

export function mapSupabaseUser(user: SupabaseAuthUser): User {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : null,
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

export async function authenticateRequest(
  request: Request,
  supabase: SupabaseAdminClient = createSupabaseServerClient(),
): Promise<User> {
  const token = getBearerToken(request);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw unauthorized("Invalid or expired authentication token.");
  }

  return mapSupabaseUser(data.user);
}
