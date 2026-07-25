import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { ExtractedInstructionInput } from "../types/analysis";
import type { MedicalInstruction } from "../types/models";
import type { InstructionRepository } from "../types/repositories";

export type InstructionRow = {
  id: string;
  care_space_id: string;
  document_id: string;
  instruction: string;
  category: string | null;
  priority: string | null;
  created_at: string;
};

export function mapInstructionRow(row: InstructionRow): MedicalInstruction {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    documentId: row.document_id,
    instruction: row.instruction,
    category: row.category,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

export class SupabaseInstructionRepository implements InstructionRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async createMany(
    careSpaceId: string,
    documentId: string,
    instructions: ExtractedInstructionInput[],
  ): Promise<MedicalInstruction[]> {
    const { error: deleteError } = await this.supabase
      .from("medical_instructions")
      .delete()
      .eq("document_id", documentId);

    throwIfSupabaseError(deleteError);

    if (instructions.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("medical_instructions")
      .insert(
        instructions.map((instruction) => ({
          care_space_id: careSpaceId,
          document_id: documentId,
          instruction: instruction.instruction,
          category: instruction.category,
          priority: instruction.priority,
        })),
      )
      .select("*");

    throwIfSupabaseError(error);

    return ((data ?? []) as InstructionRow[]).map(mapInstructionRow);
  }

  async findByDocumentId(documentId: string): Promise<MedicalInstruction[]> {
    const { data, error } = await this.supabase
      .from("medical_instructions")
      .select("*")
      .eq("document_id", documentId)
      .order("priority", { ascending: false });

    throwIfSupabaseError(error);

    return ((data ?? []) as InstructionRow[]).map(mapInstructionRow);
  }
}
