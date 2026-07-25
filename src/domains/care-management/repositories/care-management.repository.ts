import { notFound } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type {
  CareReminder,
  CareReminderListFilters,
  CareTask,
  CareTaskListFilters,
  CareTaskStatus,
  CareReminderStatus,
  CreateCareReminderInput,
  CreateCareTaskInput,
} from "../types/models";
import type { CareTaskRepository, ReminderRepository } from "../types/repositories";

type TaskRow = {
  id: string;
  care_space_id: string;
  title: string;
  description: string | null;
  status: CareTaskStatus;
  priority: CareTask["priority"];
  assigned_to: string | null;
  created_by: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ReminderRow = {
  id: string;
  care_space_id: string;
  title: string;
  description: string | null;
  status: CareReminderStatus;
  priority: CareReminder["priority"];
  scheduled_for: string;
  assigned_to: string | null;
  created_by: string;
  triggered_at: string | null;
  created_at: string;
  updated_at: string;
};

export function mapTaskRow(row: TaskRow): CareTask {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReminderRow(row: ReminderRow): CareReminder {
  return {
    id: row.id,
    careSpaceId: row.care_space_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    scheduledFor: row.scheduled_for,
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    triggeredAt: row.triggered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseCareTaskRepository implements CareTaskRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("care_members")
      .select("id")
      .eq("care_space_id", careSpaceId)
      .eq("user_id", userId)
      .maybeSingle();
    throwIfSupabaseError(error);
    if (!data) throw notFound("Care space not found.");
  }

  async create(input: CreateCareTaskInput & { createdBy: string }): Promise<CareTask> {
    const { data, error } = await this.supabase
      .from("care_tasks")
      .insert({
        care_space_id: input.careSpaceId,
        title: input.title,
        description: input.description ?? null,
        status: "pending",
        priority: input.priority ?? "medium",
        assigned_to: input.assignedTo ?? null,
        created_by: input.createdBy,
        due_at: input.dueAt ?? null,
      })
      .select("*")
      .single();
    throwIfSupabaseError(error);
    return mapTaskRow(data as TaskRow);
  }

  async findById(id: string): Promise<CareTask | null> {
    const { data, error } = await this.supabase.from("care_tasks").select("*").eq("id", id).maybeSingle();
    throwIfSupabaseError(error);
    return data ? mapTaskRow(data as TaskRow) : null;
  }

  async list(filters: CareTaskListFilters): Promise<CareTask[]> {
    let query: any = this.supabase.from("care_tasks").select("*").eq("care_space_id", filters.careSpaceId);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
    if (filters.dueBefore) query = query.lte("due_at", filters.dueBefore);
    const { data, error } = await query.order("due_at", { ascending: true, nullsFirst: false }).range(filters.offset, filters.offset + filters.limit - 1);
    throwIfSupabaseError(error);
    return ((data ?? []) as TaskRow[]).map(mapTaskRow);
  }

  async update(id: string, patch: Partial<CareTask>): Promise<CareTask> {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.priority !== undefined) update.priority = patch.priority;
    if (patch.assignedTo !== undefined) update.assigned_to = patch.assignedTo;
    if (patch.dueAt !== undefined) update.due_at = patch.dueAt;
    if (patch.completedAt !== undefined) update.completed_at = patch.completedAt;
    const { data, error } = await this.supabase.from("care_tasks").update(update).eq("id", id).select("*").maybeSingle();
    throwIfSupabaseError(error);
    if (!data) throw notFound("Care task not found.");
    return mapTaskRow(data as TaskRow);
  }

  async delete(id: string): Promise<void> {
    const { data, error } = await this.supabase.from("care_tasks").delete().eq("id", id).select("id").maybeSingle();
    throwIfSupabaseError(error);
    if (!data) throw notFound("Care task not found.");
  }
}

export class SupabaseReminderRepository implements ReminderRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async create(input: CreateCareReminderInput & { createdBy: string }): Promise<CareReminder> {
    const { data, error } = await this.supabase
      .from("care_reminders")
      .insert({
        care_space_id: input.careSpaceId,
        title: input.title,
        description: input.description ?? null,
        status: "scheduled",
        priority: input.priority ?? "medium",
        scheduled_for: input.scheduledFor,
        assigned_to: input.assignedTo ?? null,
        created_by: input.createdBy,
      })
      .select("*")
      .single();
    throwIfSupabaseError(error);
    return mapReminderRow(data as ReminderRow);
  }

  async findById(id: string): Promise<CareReminder | null> {
    const { data, error } = await this.supabase.from("care_reminders").select("*").eq("id", id).maybeSingle();
    throwIfSupabaseError(error);
    return data ? mapReminderRow(data as ReminderRow) : null;
  }

  async list(filters: CareReminderListFilters): Promise<CareReminder[]> {
    let query: any = this.supabase.from("care_reminders").select("*").eq("care_space_id", filters.careSpaceId);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
    const { data, error } = await query.order("scheduled_for", { ascending: true }).range(filters.offset, filters.offset + filters.limit - 1);
    throwIfSupabaseError(error);
    return ((data ?? []) as ReminderRow[]).map(mapReminderRow);
  }

  async findDue(now: string, limit: number): Promise<CareReminder[]> {
    const { data, error } = await this.supabase
      .from("care_reminders")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(limit);
    throwIfSupabaseError(error);
    return ((data ?? []) as ReminderRow[]).map(mapReminderRow);
  }

  async update(id: string, patch: Partial<CareReminder>): Promise<CareReminder> {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.priority !== undefined) update.priority = patch.priority;
    if (patch.scheduledFor !== undefined) update.scheduled_for = patch.scheduledFor;
    if (patch.assignedTo !== undefined) update.assigned_to = patch.assignedTo;
    if (patch.triggeredAt !== undefined) update.triggered_at = patch.triggeredAt;
    const { data, error } = await this.supabase.from("care_reminders").update(update).eq("id", id).select("*").maybeSingle();
    throwIfSupabaseError(error);
    if (!data) throw notFound("Care reminder not found.");
    return mapReminderRow(data as ReminderRow);
  }

  async delete(id: string): Promise<void> {
    const { data, error } = await this.supabase.from("care_reminders").delete().eq("id", id).select("id").maybeSingle();
    throwIfSupabaseError(error);
    if (!data) throw notFound("Care reminder not found.");
  }
}
