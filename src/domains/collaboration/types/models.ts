export const invitationStatuses = ["pending", "accepted", "revoked", "expired"] as const;
export const collaborationRoles = ["owner", "caregiver", "viewer"] as const;

export type InvitationStatus = (typeof invitationStatuses)[number];
export type CollaborationRole = (typeof collaborationRoles)[number];

export interface Invitation {
  id: string;
  careSpaceId: string;
  email: string;
  role: CollaborationRole;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  careSpaceId: string;
  body: string;
  targetType: string;
  targetId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  careSpaceId: string;
  actorId: string | null;
  activityType: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Permission {
  careSpaceId: string;
  userId: string;
  role: CollaborationRole;
}

export interface CreateInvitationInput {
  careSpaceId: string;
  email: string;
  role: CollaborationRole;
  expiresAt?: string;
}

export interface CreateCommentInput {
  careSpaceId: string;
  body: string;
  targetType: string;
  targetId?: string | null;
}
