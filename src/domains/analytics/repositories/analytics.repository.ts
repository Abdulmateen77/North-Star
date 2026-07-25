import { notFound } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { AnalyticsSnapshot } from "../types/models";
import type { AnalyticsRepository } from "../types/repositories";

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}
  async assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase.from("care_members").select("id").eq("care_space_id", careSpaceId).eq("user_id", userId).maybeSingle();
    throwIfSupabaseError(error); if (!data) throw notFound("Care space not found.");
  }
  async getAnalyticsSnapshot(careSpaceId: string): Promise<AnalyticsSnapshot> {
    const [tasks, reminders, medications, appointments, timeline] = await Promise.all([
      this.safeSelect("care_tasks", careSpaceId),
      this.safeSelect("care_reminders", careSpaceId),
      this.safeSelect("medications", careSpaceId),
      this.safeSelect("appointments", careSpaceId),
      this.safeSelect("timeline_events", careSpaceId),
    ]);
    return { tasks: tasks as AnalyticsSnapshot["tasks"], reminders: reminders as AnalyticsSnapshot["reminders"], medications: medications as AnalyticsSnapshot["medications"], appointments: appointments as AnalyticsSnapshot["appointments"], timeline: timeline as AnalyticsSnapshot["timeline"] };
  }
  private async safeSelect(table: string, careSpaceId: string): Promise<unknown[]> { const { data, error } = await this.supabase.from(table).select("*").eq("care_space_id", careSpaceId).limit(200); if (error) return []; return data ?? []; }
}
