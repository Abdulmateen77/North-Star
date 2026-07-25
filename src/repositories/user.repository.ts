import type { User } from "@/domain/models";
import type { SupabaseAdminClient } from "@/lib/supabase/server";

import { throwIfSupabaseError } from "./supabase-errors";
import type { UserRepository } from "./types";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? toUser(data as UserRow) : null;
  }

  async upsert(user: User): Promise<User> {
    const { data, error } = await this.supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        avatar_url: user.avatarUrl,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error);

    return toUser(data as UserRow);
  }

  async update(id: string, input: Partial<Pick<User, "fullName" | "avatarUrl">>): Promise<User | null> {
    const patch: Record<string, string | null> = {};

    if (input.fullName !== undefined) {
      patch.full_name = input.fullName;
    }

    if (input.avatarUrl !== undefined) {
      patch.avatar_url = input.avatarUrl;
    }

    const { data, error } = await this.supabase
      .from("profiles")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? toUser(data as UserRow) : null;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("profiles").delete().eq("id", id);

    throwIfSupabaseError(error);
  }
}
