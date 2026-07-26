import type { User } from "@/domain/models";
import { notFound } from "@/lib/errors";
import {
  createSupabaseServerClient,
  type SupabaseAdminClient,
} from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

/**
 * There is no sign-in flow, so every request acts as the single seeded
 * profile (see scripts/seed-test-user.mjs). This app is single-tenant.
 */
export async function getDefaultActor(
  supabase: SupabaseAdminClient = createSupabaseServerClient(),
): Promise<User> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw notFound("No user profile found. Run scripts/seed-test-user.mjs first.");
  }

  const row = data as ProfileRow;

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}
