import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { AuditLog, AuditLogRepository, CreateAuditLogInput } from "./models";

type AuditLogRow = {
  id: string;
  care_space_id: string;
  actor_id: string | null;
  action: string;
  source_domain: string;
  source_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export function mapAuditLogRow(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    actorId: row.actor_id,
    action: row.action,
    sourceDomain: row.source_domain,
    sourceId: row.source_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export class SupabaseAuditLogRepository implements AuditLogRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .insert({
        care_space_id: input.careSpaceId,
        actor_id: input.actorId ?? null,
        action: input.action,
        source_domain: input.sourceDomain,
        source_id: input.sourceId ?? null,
        metadata: input.metadata ?? {},
        created_at: input.createdAt ?? new Date().toISOString(),
      })
      .select("*")
      .single();

    throwIfSupabaseError(error);
    return mapAuditLogRow(data as AuditLogRow);
  }
}
