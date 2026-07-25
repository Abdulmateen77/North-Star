export const careMemberRoles = ["owner", "caregiver", "viewer"] as const;

export type CareMemberRole = (typeof careMemberRoles)[number];

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CareSpace {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareMember {
  id: string;
  careSpaceId: string;
  userId: string;
  role: CareMemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareSpaceInput {
  name: string;
  description?: string | null;
}

export interface UpdateCareSpaceInput {
  name?: string;
  description?: string | null;
}

export interface CreateCareMemberInput {
  userId: string;
  role: CareMemberRole;
}

export interface UpdateCareMemberInput {
  role?: CareMemberRole;
}

export interface UpdateUserInput {
  fullName?: string | null;
  avatarUrl?: string | null;
}
