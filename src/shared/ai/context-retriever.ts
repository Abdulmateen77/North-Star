import { notFound } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { ContextRetriever, PlatformCareContext } from "./types";

export class SupabaseContextRetriever implements ContextRetriever {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("care_members")
      .select("id")
      .eq("care_space_id", careSpaceId)
      .eq("user_id", userId)
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!data) {
      throw notFound("Care space not found.");
    }
  }

  async retrieve(careSpaceId: string): Promise<PlatformCareContext> {
    const [documents, appointments, medications, tasks, reminders, timeline] = await Promise.all([
      this.selectByCareSpace("documents", careSpaceId),
      this.selectByCareSpace("appointments", careSpaceId),
      this.selectByCareSpace("medications", careSpaceId),
      this.selectByCareSpace("care_tasks", careSpaceId),
      this.selectByCareSpace("care_reminders", careSpaceId),
      this.selectByCareSpace("timeline_events", careSpaceId),
    ]);

    return { documents, appointments, medications, tasks, reminders, timeline };
  }

  private async selectByCareSpace(table: string, careSpaceId: string): Promise<unknown[]> {
    const { data, error } = await this.supabase
      .from(table)
      .select("*")
      .eq("care_space_id", careSpaceId)
      .limit(50);

    if (error) {
      return [];
    }

    return data ?? [];
  }
}
