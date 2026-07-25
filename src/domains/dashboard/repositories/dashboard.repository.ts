import { notFound } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { DashboardSnapshot } from "../types/models";
import type { DashboardRepository } from "../types/repositories";

export class SupabaseDashboardRepository implements DashboardRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}
  async assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase.from("care_members").select("id").eq("care_space_id", careSpaceId).eq("user_id", userId).maybeSingle();
    throwIfSupabaseError(error); if (!data) throw notFound("Care space not found.");
  }
  async getDashboardSnapshot(careSpaceId: string): Promise<DashboardSnapshot> {
    const [carePlan, todayTasks, upcomingAppointments, reminders, timeline, recentDocuments, activityFeed, medications] = await Promise.all([
      this.safeSelect("care_plans", careSpaceId, 1),
      this.safeSelect("care_tasks", careSpaceId, 10),
      this.safeSelect("appointments", careSpaceId, 10),
      this.safeSelect("care_reminders", careSpaceId, 10),
      this.safeSelect("timeline_events", careSpaceId, 10),
      this.safeSelect("documents", careSpaceId, 10),
      this.safeSelect("activity_feed", careSpaceId, 10),
      this.safeSelect("medications", careSpaceId, 20),
    ]);
    return { patient: null, carePlan: carePlan[0] ?? null, todayTasks, upcomingAppointments, reminders, timeline, alerts: [], medicationStatus: medications, recentDocuments, activityFeed };
  }
  private async safeSelect(table: string, careSpaceId: string, limit: number): Promise<unknown[]> {
    const { data, error } = await this.supabase.from(table).select("*").eq("care_space_id", careSpaceId).limit(limit);
    if (error) return [];
    return data ?? [];
  }
}
