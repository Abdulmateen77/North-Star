import { z } from "zod";

import { collaborationRoles } from "../types/models";

export const createInvitationSchema = z.object({
  careSpaceId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(collaborationRoles).default("caregiver"),
});

export const acceptInvitationSchema = z.object({ token: z.string().min(16) });

export const updatePermissionSchema = z.object({
  careSpaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(collaborationRoles),
});

export const activityQuerySchema = z.object({
  careSpaceId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const createCommentSchema = z.object({
  careSpaceId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
  targetType: z.string().trim().min(1).max(100),
  targetId: z.string().uuid().nullable().optional(),
});

export const listCommentQuerySchema = z.object({
  careSpaceId: z.string().uuid(),
  targetType: z.string().trim().min(1).optional(),
  targetId: z.string().uuid().optional(),
});
