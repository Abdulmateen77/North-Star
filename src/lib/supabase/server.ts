import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnv } from "../env";

export type SupabaseAdminClient = SupabaseClient<any, "public", any>;

export function createSupabaseServerClient(): SupabaseAdminClient {
  const env = getEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as SupabaseAdminClient;
}
