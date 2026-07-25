import type { CareMember, CareMemberRole } from "@/domain/models";
import type { SupabaseAdminClient } from "@/lib/supabase/server";

import { throwIfSupabaseError } from "./supabase-errors";
import type {
  CareMemberRepository,
  CreateCareMemberRecord,
} from "./types";

type CareMemberRow = {
  id: string;
  care_space_id: string;
  user_id: string;
  role: CareMemberRole;
  created_at: string;
  updated_at: string;
};

function toCareMember(row: CareMemberRow): CareMember {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseCareMemberRepository implements CareMemberRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async create(input: CreateCareMemberRecord): Promise<CareMember> {
    const { data, error } = await this.supabase
      .from("care_members")
      .insert({
        care_space_id: input.careSpaceId,
        user_id: input.userId,
        role: input.role,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error);

    return toCareMember(data as CareMemberRow);
  }

  async findById(id: string): Promise<CareMember | null> {
    const { data, error } = await this.supabase
      .from("care_members")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? toCareMember(data as CareMemberRow) : null;
  }

  async findByCareSpaceAndUser(careSpaceId: string, userId: string): Promise<CareMember | null> {
    const { data, error } = await this.supabase
      .from("care_members")
      .select("*")
      .eq("care_space_id", careSpaceId)
      .eq("user_id", userId)
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? toCareMember(data as CareMemberRow) : null;
  }

  async findByCareSpaceId(careSpaceId: string): Promise<CareMember[]> {
    const { data, error } = await this.supabase
      .from("care_members")
      .select("*")
      .eq("care_space_id", careSpaceId)
      .order("created_at", { ascending: true });

    throwIfSupabaseError(error);

    return ((data ?? []) as CareMemberRow[]).map(toCareMember);
  }

  async update(id: string, input: Partial<Pick<CareMember, "role">>): Promise<CareMember | null> {
    const patch: Record<string, CareMemberRole> = {};

    if (input.role !== undefined) {
      patch.role = input.role;
    }

    const { data, error } = await this.supabase
      .from("care_members")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? toCareMember(data as CareMemberRow) : null;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("care_members").delete().eq("id", id);

    throwIfSupabaseError(error);
  }
}
