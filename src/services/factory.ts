import { SupabaseCareMemberRepository } from "@/repositories/care-member.repository";
import { SupabaseCareSpaceRepository } from "@/repositories/care-space.repository";
import { SupabaseUserRepository } from "@/repositories/user.repository";

import { createSupabaseServerClient } from "../lib/supabase/server";
import { CareSpaceService } from "./care-space.service";
import { UserService } from "./user.service";

export function createCareSpaceService(): CareSpaceService {
  const supabase = createSupabaseServerClient();

  return new CareSpaceService(
    new SupabaseCareSpaceRepository(supabase),
    new SupabaseCareMemberRepository(supabase),
  );
}

export function createUserService(): UserService {
  const supabase = createSupabaseServerClient();

  return new UserService(new SupabaseUserRepository(supabase));
}
