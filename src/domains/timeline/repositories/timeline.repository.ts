import { notFound } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { CreateTimelineEventInput, TimelineEvent, TimelineListFilters, TimelineListResult } from "../types/models";
import type { TimelineRepository } from "../types/repositories";

type TimelineRow = {
  id: string;
  care_space_id: string;
  event_type: string;
  title: string;
  description: string | null;
  source_domain: string;
  source_id: string | null;
  created_by: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

export function mapTimelineRow(row: TimelineRow): TimelineEvent {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    eventType: row.event_type,
    title: row.title,
    description: row.description,
    sourceDomain: row.source_domain,
    sourceId: row.source_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    metadata: row.metadata ?? {},
  };
}

export class SupabaseTimelineRepository implements TimelineRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase.from("care_members").select("id").eq("care_space_id", careSpaceId).eq("user_id", userId).maybeSingle();
    throwIfSupabaseError(error);
    if (!data) throw notFound("Care space not found.");
  }

  async create(input: CreateTimelineEventInput): Promise<TimelineEvent> {
    const { data, error } = await this.supabase
      .from("timeline_events")
      .insert({
        care_space_id: input.careSpaceId,
        event_type: input.eventType,
        title: input.title,
        description: input.description ?? null,
        source_domain: input.sourceDomain,
        source_id: input.sourceId ?? null,
        created_by: input.createdBy ?? null,
        created_at: input.createdAt ?? new Date().toISOString(),
        metadata: input.metadata ?? {},
      })
      .select("*")
      .single();
    throwIfSupabaseError(error);
    return mapTimelineRow(data as TimelineRow);
  }

  async findById(id: string): Promise<TimelineEvent | null> {
    const { data, error } = await this.supabase.from("timeline_events").select("*").eq("id", id).maybeSingle();
    throwIfSupabaseError(error);
    return data ? mapTimelineRow(data as TimelineRow) : null;
  }

  async list(filters: TimelineListFilters): Promise<TimelineListResult> {
    let query: any = this.supabase.from("timeline_events").select("*", { count: "exact" }).eq("care_space_id", filters.careSpaceId);
    if (filters.eventType) query = query.eq("event_type", filters.eventType);
    if (filters.sourceDomain) query = query.eq("source_domain", filters.sourceDomain);
    const { data, error, count } = await query.order("created_at", { ascending: false }).range(filters.offset, filters.offset + filters.limit - 1);
    throwIfSupabaseError(error);
    return { events: ((data ?? []) as TimelineRow[]).map(mapTimelineRow), total: count ?? 0, limit: filters.limit, offset: filters.offset };
  }
}
