import { notFound } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { CreateSubscriptionInput, Notification, NotificationChannel, SendNotificationInput, Subscription } from "../types/models";
import type { NotificationRepository } from "../types/repositories";

type NotificationRow = { id:string; care_space_id:string; recipient_id:string; title:string; body:string; channel:NotificationChannel; read_at:string|null; created_at:string };
type SubscriptionRow = { id:string; care_space_id:string; user_id:string; channel:NotificationChannel; endpoint:string; created_at:string };
function mapNotification(row: NotificationRow): Notification { return { id:row.id, careSpaceId:row.care_space_id, recipientId:row.recipient_id, title:row.title, body:row.body, channel:row.channel, readAt:row.read_at, createdAt:row.created_at }; }
function mapSubscription(row: SubscriptionRow): Subscription { return { id:row.id, careSpaceId:row.care_space_id, userId:row.user_id, channel:row.channel, endpoint:row.endpoint, createdAt:row.created_at }; }

export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}
  async assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase.from("care_members").select("id").eq("care_space_id", careSpaceId).eq("user_id", userId).maybeSingle();
    throwIfSupabaseError(error); if (!data) throw notFound("Care space not found.");
  }
  async create(input: SendNotificationInput): Promise<Notification> {
    const { data, error } = await this.supabase.from("notifications").insert({ care_space_id:input.careSpaceId, recipient_id:input.recipientId, title:input.title, body:input.body, channel:input.channel }).select("*").single();
    throwIfSupabaseError(error); return mapNotification(data as NotificationRow);
  }
  async list(careSpaceId: string, userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase.from("notifications").select("*").eq("care_space_id", careSpaceId).eq("recipient_id", userId).order("created_at", { ascending:false }).limit(100);
    throwIfSupabaseError(error); return ((data ?? []) as NotificationRow[]).map(mapNotification);
  }
  async subscribe(input: CreateSubscriptionInput & { userId: string }): Promise<Subscription> {
    const { data, error } = await this.supabase.from("notification_subscriptions").insert({ care_space_id:input.careSpaceId, user_id:input.userId, channel:input.channel, endpoint:input.endpoint }).select("*").single();
    throwIfSupabaseError(error); return mapSubscription(data as SubscriptionRow);
  }
}
