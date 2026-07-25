import { notFound, forbidden } from "@/lib/errors";
import type { SupabaseAdminClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/repositories/supabase-errors";

import type { ActivityFeedItem, Comment, CollaborationRole, CreateCommentInput, CreateInvitationInput, Invitation, Permission } from "../types/models";
import type { ActivityRepository, CommentRepository, InvitationRepository, PermissionRepository } from "../types/repositories";

type InvitationRow = { id:string; care_space_id:string; email:string; role:CollaborationRole; invited_by:string; token:string; status:Invitation["status"]; expires_at:string; accepted_at:string|null; created_at:string };
type CommentRow = { id:string; care_space_id:string; body:string; target_type:string; target_id:string|null; created_by:string; created_at:string };
type ActivityRow = { id:string; care_space_id:string; actor_id:string|null; activity_type:string; title:string; description:string|null; metadata:Record<string, unknown>|null; created_at:string };

function mapInvitation(row: InvitationRow): Invitation { return { id:row.id, careSpaceId:row.care_space_id, email:row.email, role:row.role, invitedBy:row.invited_by, token:row.token, status:row.status, expiresAt:row.expires_at, acceptedAt:row.accepted_at, createdAt:row.created_at }; }
function mapComment(row: CommentRow): Comment { return { id:row.id, careSpaceId:row.care_space_id, body:row.body, targetType:row.target_type, targetId:row.target_id, createdBy:row.created_by, createdAt:row.created_at }; }
function mapActivity(row: ActivityRow): ActivityFeedItem { return { id:row.id, careSpaceId:row.care_space_id, actorId:row.actor_id, activityType:row.activity_type, title:row.title, description:row.description, metadata:row.metadata ?? {}, createdAt:row.created_at }; }

async function assertMember(supabase: SupabaseAdminClient, careSpaceId: string, userId: string): Promise<void> {
  const { data, error } = await supabase.from("care_members").select("id, role").eq("care_space_id", careSpaceId).eq("user_id", userId).maybeSingle();
  throwIfSupabaseError(error);
  if (!data) throw notFound("Care space not found.");
}

export class SupabaseInvitationRepository implements InvitationRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> { return assertMember(this.supabase, careSpaceId, userId); }
  async create(input: CreateInvitationInput & { invitedBy: string; token: string; expiresAt: string }): Promise<Invitation> {
    const { data, error } = await this.supabase.from("invitations").insert({ care_space_id:input.careSpaceId, email:input.email, role:input.role, invited_by:input.invitedBy, token:input.token, status:"pending", expires_at:input.expiresAt }).select("*").single();
    throwIfSupabaseError(error); return mapInvitation(data as InvitationRow);
  }
  async findByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await this.supabase.from("invitations").select("*").eq("token", token).maybeSingle();
    throwIfSupabaseError(error); return data ? mapInvitation(data as InvitationRow) : null;
  }
  async accept(invitationId: string, acceptedBy: string): Promise<Invitation> {
    const { data, error } = await this.supabase.from("invitations").update({ status:"accepted", accepted_at:new Date().toISOString() }).eq("id", invitationId).select("*").maybeSingle();
    throwIfSupabaseError(error); if (!data) throw notFound("Invitation not found."); return mapInvitation(data as InvitationRow);
  }
  async list(careSpaceId: string): Promise<Invitation[]> {
    const { data, error } = await this.supabase.from("invitations").select("*").eq("care_space_id", careSpaceId).order("created_at", { ascending:false });
    throwIfSupabaseError(error); return ((data ?? []) as InvitationRow[]).map(mapInvitation);
  }
}

export class SupabasePermissionRepository implements PermissionRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}
  async assertCareSpaceOwner(careSpaceId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase.from("care_members").select("id, role").eq("care_space_id", careSpaceId).eq("user_id", userId).maybeSingle();
    throwIfSupabaseError(error); if (!data) throw notFound("Care space not found."); if ((data as {role:string}).role !== "owner") throw forbidden("Only owners can update permissions.");
  }
  async updateRole(careSpaceId: string, userId: string, role: CollaborationRole): Promise<Permission> {
    const { error } = await this.supabase.from("care_members").update({ role }).eq("care_space_id", careSpaceId).eq("user_id", userId);
    throwIfSupabaseError(error); return { careSpaceId, userId, role };
  }
}

export class SupabaseActivityRepository implements ActivityRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> { return assertMember(this.supabase, careSpaceId, userId); }
  async list(careSpaceId: string, limit: number, offset: number): Promise<ActivityFeedItem[]> {
    const { data, error } = await this.supabase.from("activity_feed").select("*").eq("care_space_id", careSpaceId).order("created_at", { ascending:false }).range(offset, offset + limit - 1);
    throwIfSupabaseError(error); return ((data ?? []) as ActivityRow[]).map(mapActivity);
  }
}

export class SupabaseCommentRepository implements CommentRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void> { return assertMember(this.supabase, careSpaceId, userId); }
  async create(input: CreateCommentInput & { createdBy: string }): Promise<Comment> {
    const { data, error } = await this.supabase.from("comments").insert({ care_space_id:input.careSpaceId, body:input.body, target_type:input.targetType, target_id:input.targetId ?? null, created_by:input.createdBy }).select("*").single();
    throwIfSupabaseError(error); return mapComment(data as CommentRow);
  }
  async list(careSpaceId: string, targetType?: string, targetId?: string): Promise<Comment[]> {
    let query:any = this.supabase.from("comments").select("*").eq("care_space_id", careSpaceId);
    if (targetType) query = query.eq("target_type", targetType);
    if (targetId) query = query.eq("target_id", targetId);
    const { data, error } = await query.order("created_at", { ascending:true });
    throwIfSupabaseError(error); return ((data ?? []) as CommentRow[]).map(mapComment);
  }
}
