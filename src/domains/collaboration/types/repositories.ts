import type {
  ActivityFeedItem,
  Comment,
  CollaborationRole,
  CreateCommentInput,
  CreateInvitationInput,
  Invitation,
  Permission,
} from "./models";

export interface InvitationRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  create(input: CreateInvitationInput & { invitedBy: string; token: string; expiresAt: string }): Promise<Invitation>;
  findByToken(token: string): Promise<Invitation | null>;
  accept(invitationId: string, acceptedBy: string): Promise<Invitation>;
  list(careSpaceId: string): Promise<Invitation[]>;
}

export interface PermissionRepository {
  assertCareSpaceOwner(careSpaceId: string, userId: string): Promise<void>;
  updateRole(careSpaceId: string, userId: string, role: CollaborationRole): Promise<Permission>;
}

export interface ActivityRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  list(careSpaceId: string, limit: number, offset: number): Promise<ActivityFeedItem[]>;
}

export interface CommentRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  create(input: CreateCommentInput & { createdBy: string }): Promise<Comment>;
  list(careSpaceId: string, targetType?: string, targetId?: string): Promise<Comment[]>;
}
