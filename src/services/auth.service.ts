import type { User } from "@/domain/models";
import { notFound, unauthorized } from "@/lib/errors";
import {
  createSupabaseServerClient,
  type SupabaseAdminClient,
} from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export interface ActorResolutionOptions {
  supabase?: SupabaseAdminClient;
  allowDemoActor?: boolean;
}

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

function demoActorAllowed(options: ActorResolutionOptions): boolean {
  return options.allowDemoActor ?? (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_ACTOR === "true");
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    throw unauthorized("Invalid authorization header.");
  }

  return match[1];
}

/**
 * Demo-only actor lookup retained for local seeded development.
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

  return toUser(data as ProfileRow);
}

/**
 * Resolves the request actor from Supabase Auth. The seeded first-profile
 * lookup is available only as an explicit local/demo fallback.
 */
export async function getActorFromRequest(
  request: Request,
  options: ActorResolutionOptions = {},
): Promise<User> {
  const supabase = options.supabase ?? createSupabaseServerClient();
  const token = bearerToken(request);

  if (!token) {
    if (!demoActorAllowed(options)) {
      throw unauthorized();
    }

    return getDefaultActor(supabase);
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw unauthorized("Invalid or expired authentication token.");
  }

  const authUser = data.user as AuthenticatedUser;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  throwIfSupabaseError(profileError);

  if (profile) {
    return toUser(profile as ProfileRow);
  }

  const email = authUser.email?.trim();
  if (!email) {
    throw notFound("Authenticated user profile is missing an email address.");
  }

  const metadata = authUser.user_metadata ?? {};
  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .upsert({
      id: authUser.id,
      email,
      full_name: typeof metadata.full_name === "string" ? metadata.full_name : null,
      avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    })
    .select("*")
    .single();

  throwIfSupabaseError(createError);

  if (!createdProfile) {
    throw notFound("Authenticated user profile could not be created.");
  }

  return toUser(createdProfile as ProfileRow);
}
