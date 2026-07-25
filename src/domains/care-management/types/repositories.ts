import type {
  CareReminder,
  CareReminderListFilters,
  CareTask,
  CareTaskListFilters,
  CreateCareReminderInput,
  CreateCareTaskInput,
} from "./models";

export interface CareTaskRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  create(input: CreateCareTaskInput & { createdBy: string }): Promise<CareTask>;
  findById(id: string): Promise<CareTask | null>;
  list(filters: CareTaskListFilters): Promise<CareTask[]>;
  update(id: string, patch: Partial<CareTask>): Promise<CareTask>;
  delete(id: string): Promise<void>;
}

export interface ReminderRepository {
  create(input: CreateCareReminderInput & { createdBy: string }): Promise<CareReminder>;
  findById(id: string): Promise<CareReminder | null>;
  list(filters: CareReminderListFilters): Promise<CareReminder[]>;
  update(id: string, patch: Partial<CareReminder>): Promise<CareReminder>;
  delete(id: string): Promise<void>;
}
