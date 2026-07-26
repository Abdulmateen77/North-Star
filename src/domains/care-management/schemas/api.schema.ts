import { z } from "zod";

import { carePriorities, careReminderStatuses, careTaskStatuses } from "../types/models";

export const createTaskSchema = z.object({
  careSpaceId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(carePriorities).default("medium"),
  assignedTo: z.string().uuid().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
});

export const createReminderSchema = z.object({
  careSpaceId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(carePriorities).default("medium"),
  assignedTo: z.string().uuid().nullable().optional(),
  scheduledFor: z.string().datetime(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: z.enum(careTaskStatuses).optional(),
    priority: z.enum(carePriorities).optional(),
    assignedTo: z.string().uuid().nullable().optional(),
    dueAt: z.string().datetime().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one task field is required.");

export const updateReminderSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: z.enum(careReminderStatuses).optional(),
    priority: z.enum(carePriorities).optional(),
    scheduledFor: z.string().datetime().optional(),
    assignedTo: z.string().uuid().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one reminder field is required.");

export const listTasksQuerySchema = z.object({
  careSpaceId: z.string().uuid(),
  status: z.enum(careTaskStatuses).optional(),
  assignedTo: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listRemindersQuerySchema = z.object({
  careSpaceId: z.string().uuid(),
  status: z.enum(careReminderStatuses).optional(),
  assignedTo: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const taskIdParamSchema = z.object({ id: z.string().uuid() });
export const reminderIdParamSchema = z.object({ id: z.string().uuid() });
