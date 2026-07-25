import type { CareSpace } from "@/domain/models";
import type { SupabaseAdminClient } from "@/lib/supabase/server";

import { throwIfSupabaseError } from "./supabase-errors";
import type {
  CareSpaceRepository,
  CreateCareSpaceRecord,
} from "./types";

type CareSpaceRow = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

function toCareSpace(row: CareSpaceRow): CareSpace {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseCareSpaceRepository implements CareSpaceRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async create(input: CreateCareSpaceRecord): Promise<CareSpace> {
    const { data, error } = await this.supabase
      .from("care_spaces")
      .insert({
        name: input.name,
        description: input.description ?? null,
        owner_id: input.ownerId,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error);

    return toCareSpace(data as CareSpaceRow);
  }

  async findById(id: string): Promise<CareSpace | null> {
    const { data, error } = await this.supabase
      .from("care_spaces")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? toCareSpace(data as CareSpaceRow) : null;
  }

  async findByUserId(userId: string): Promise<CareSpace[]> {
    const { data: memberRows, error: memberError } = await this.supabase
      .from("care_members")
      .select("care_space_id")
      .eq("user_id", userId);

    throwIfSupabaseError(memberError);

    const careSpaceIds = ((memberRows ?? []) as Array<{ care_space_id: string }>).map(
      (member) => member.care_space_id,
    );

    if (careSpaceIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("care_spaces")
      .select("*")
      .in("id", careSpaceIds)
      .order("created_at", { ascending: false });

    throwIfSupabaseError(error);

    return ((data ?? []) as CareSpaceRow[]).map(toCareSpace);
  }

  async update(id: string, input: Partial<Pick<CareSpace, "name" | "description">>): Promise<CareSpace | null> {
    const patch: Record<string, string | null> = {};

    if (input.name !== undefined) {
      patch.name = input.name;
    }

    if (input.description !== undefined) {
      patch.description = input.description;
    }

    const { data, error } = await this.supabase
      .from("care_spaces")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error);

    return data ? toCareSpace(data as CareSpaceRow) : null;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("care_spaces").delete().eq("id", id);

    throwIfSupabaseError(error);
  }
}
