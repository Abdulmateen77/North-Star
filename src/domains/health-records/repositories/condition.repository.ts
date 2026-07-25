import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { ExtractedConditionInput } from "../types/analysis";
import type { MedicalCondition } from "../types/models";
import type { ConditionRepository } from "../types/repositories";

export type ConditionRow = {
  id: string;
  care_space_id: string;
  document_id: string;
  name: string;
  severity: string | null;
  notes: string | null;
  created_at: string;
};

export function mapConditionRow(row: ConditionRow): MedicalCondition {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    documentId: row.document_id,
    name: row.name,
    severity: row.severity,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export class SupabaseConditionRepository implements ConditionRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async createMany(
    careSpaceId: string,
    documentId: string,
    conditions: ExtractedConditionInput[],
  ): Promise<MedicalCondition[]> {
    const { error: deleteError } = await this.supabase
      .from("conditions")
      .delete()
      .eq("document_id", documentId);

    throwIfSupabaseError(deleteError);

    if (conditions.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("conditions")
      .insert(
        conditions.map((condition) => ({
          care_space_id: careSpaceId,
          document_id: documentId,
          name: condition.name,
          severity: condition.severity,
          notes: condition.notes,
        })),
      )
      .select("*");

    throwIfSupabaseError(error);

    return ((data ?? []) as ConditionRow[]).map(mapConditionRow);
  }

  async findByDocumentId(documentId: string): Promise<MedicalCondition[]> {
    const { data, error } = await this.supabase
      .from("conditions")
      .select("*")
      .eq("document_id", documentId)
      .order("name", { ascending: true });

    throwIfSupabaseError(error);

    return ((data ?? []) as ConditionRow[]).map(mapConditionRow);
  }
}
