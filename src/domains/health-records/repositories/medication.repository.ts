import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { ExtractedMedicationInput } from "../types/analysis";
import type { Medication } from "../types/models";
import type { MedicationRepository } from "../types/repositories";

export type MedicationRow = {
  id: string;
  care_space_id: string;
  document_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
  created_at: string;
};

export function mapMedicationRow(row: MedicationRow): Medication {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    documentId: row.document_id,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency,
    instructions: row.instructions,
    createdAt: row.created_at,
  };
}

export class SupabaseMedicationRepository implements MedicationRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async createMany(
    careSpaceId: string,
    documentId: string,
    medications: ExtractedMedicationInput[],
  ): Promise<Medication[]> {
    const { error: deleteError } = await this.supabase
      .from("medications")
      .delete()
      .eq("document_id", documentId);

    throwIfSupabaseError(deleteError);

    if (medications.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("medications")
      .insert(
        medications.map((medication) => ({
          care_space_id: careSpaceId,
          document_id: documentId,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          instructions: medication.instructions,
        })),
      )
      .select("*");

    throwIfSupabaseError(error);

    return ((data ?? []) as MedicationRow[]).map(mapMedicationRow);
  }

  async findByDocumentId(documentId: string): Promise<Medication[]> {
    const { data, error } = await this.supabase
      .from("medications")
      .select("*")
      .eq("document_id", documentId)
      .order("name", { ascending: true });

    throwIfSupabaseError(error);

    return ((data ?? []) as MedicationRow[]).map(mapMedicationRow);
  }

  async findByCareSpaceId(careSpaceId: string): Promise<Medication[]> {
    const { data, error } = await this.supabase
      .from("medications")
      .select("*")
      .eq("care_space_id", careSpaceId)
      .order("name", { ascending: true });

    throwIfSupabaseError(error);

    return ((data ?? []) as MedicationRow[]).map(mapMedicationRow);
  }
}
