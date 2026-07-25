import { z } from "zod";

import { careMemberRoles } from "./models";

export const uuidSchema = z.string().uuid();

export const careMemberRoleSchema = z.enum(careMemberRoles);

export const createCareSpaceSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2_000).nullable().optional(),
  })
  .strict();

export const updateCareSpaceSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2_000).nullable().optional(),
  })
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one care space field must be provided.",
  });

export const createCareMemberSchema = z
  .object({
    userId: uuidSchema,
    role: careMemberRoleSchema.default("caregiver"),
  })
  .strict();

export const updateCareMemberSchema = z
  .object({
    role: careMemberRoleSchema.optional(),
  })
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one care member field must be provided.",
  });

export const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(1).max(160).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one user field must be provided.",
  });

export const careSpaceIdParamSchema = z.object({
  careSpaceId: uuidSchema,
});

export const careMemberIdParamSchema = z.object({
  careSpaceId: uuidSchema,
  careMemberId: uuidSchema,
});
