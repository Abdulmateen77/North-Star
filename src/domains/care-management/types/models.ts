export const careTaskStatuses = ["pending", "in_progress", "completed", "cancelled"] as const;
export const careReminderStatuses = ["scheduled", "triggered", "dismissed", "missed", "cancelled"] as const;
export const carePriorities = ["low", "medium", "high", "urgent"] as const;

export type CareTaskStatus = (typeof careTaskStatuses)[number];
export type CareReminderStatus = (typeof careReminderStatuses)[number];
export type CarePriority = (typeof carePriorities)[number];

export interface CareTask {
  id: string;
  careSpaceId: string;
  title: string;
  description: string | null;
  status: CareTaskStatus;
  priority: CarePriority;
  assignedTo: string | null;
  createdBy: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareReminder {
  id: string;
  careSpaceId: string;
  title: string;
  description: string | null;
  status: CareReminderStatus;
  priority: CarePriority;
  scheduledFor: string;
  assignedTo: string | null;
  createdBy: string;
  triggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CarePlan {
  id: string;
  careSpaceId: string;
  title: string;
  summary: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareTaskInput {
  careSpaceId: string;
  title: string;
  description?: string | null;
  priority?: CarePriority;
  assignedTo?: string | null;
  dueAt?: string | null;
}

export interface CreateCareReminderInput {
  careSpaceId: string;
  title: string;
  description?: string | null;
  priority?: CarePriority;
  assignedTo?: string | null;
  scheduledFor: string;
}

export interface CareTaskListFilters {
  careSpaceId: string;
  status?: CareTaskStatus;
  assignedTo?: string;
  dueBefore?: string;
  limit: number;
  offset: number;
}

export interface CareReminderListFilters {
  careSpaceId: string;
  status?: CareReminderStatus;
  assignedTo?: string;
  limit: number;
  offset: number;
}
