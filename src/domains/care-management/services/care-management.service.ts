import { notFound } from "@/lib/errors";
import type { DomainEventPublisher } from "@/shared/events/domain-events";

import type {
  CareReminder,
  CareReminderListFilters,
  CareTask,
  CareTaskListFilters,
  CreateCareReminderInput,
  CreateCareTaskInput,
} from "../types/models";
import type { CareTaskRepository, ReminderRepository } from "../types/repositories";

export class CareManagementService {
  constructor(
    private readonly tasks: CareTaskRepository,
    private readonly reminders: ReminderRepository,
    private readonly events: DomainEventPublisher,
  ) {}

  async createTask(actorId: string, input: CreateCareTaskInput): Promise<CareTask> {
    await this.tasks.assertCareSpaceMember(input.careSpaceId, actorId);
    if (input.assignedTo) {
      await this.tasks.assertCareSpaceMember(input.careSpaceId, input.assignedTo);
    }

    const task = await this.tasks.create({ ...input, createdBy: actorId });
    await this.events.publish({
      type: "TaskCreated",
      careSpaceId: task.careSpaceId,
      taskId: task.id,
      title: task.title,
      createdBy: actorId,
      occurredAt: new Date().toISOString(),
    });

    if (task.assignedTo) {
      await this.events.publish({
        type: "TaskAssigned",
        careSpaceId: task.careSpaceId,
        taskId: task.id,
        title: task.title,
        assignedTo: task.assignedTo,
        assignedBy: actorId,
        occurredAt: new Date().toISOString(),
      });
    }

    return task;
  }

  async completeTask(actorId: string, taskId: string): Promise<CareTask> {
    const task = await this.tasks.findById(taskId);
    if (!task) {
      throw notFound("Care task not found.");
    }

    await this.tasks.assertCareSpaceMember(task.careSpaceId, actorId);
    const completed = await this.tasks.update(taskId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    await this.events.publish({
      type: "TaskCompleted",
      careSpaceId: completed.careSpaceId,
      taskId: completed.id,
      title: completed.title,
      completedBy: actorId,
      occurredAt: new Date().toISOString(),
    });

    return completed;
  }

  async listTasks(actorId: string, filters: CareTaskListFilters): Promise<CareTask[]> {
    await this.tasks.assertCareSpaceMember(filters.careSpaceId, actorId);
    return this.tasks.list(filters);
  }

  async createReminder(actorId: string, input: CreateCareReminderInput): Promise<CareReminder> {
    await this.tasks.assertCareSpaceMember(input.careSpaceId, actorId);
    if (input.assignedTo) {
      await this.tasks.assertCareSpaceMember(input.careSpaceId, input.assignedTo);
    }

    const reminder = await this.reminders.create({ ...input, createdBy: actorId });
    await this.events.publish({
      type: "ReminderCreated",
      careSpaceId: reminder.careSpaceId,
      reminderId: reminder.id,
      title: reminder.title,
      createdBy: actorId,
      occurredAt: new Date().toISOString(),
    });

    return reminder;
  }

  async triggerReminder(actorId: string, reminderId: string): Promise<CareReminder> {
    const reminder = await this.reminders.findById(reminderId);
    if (!reminder) {
      throw notFound("Care reminder not found.");
    }

    await this.tasks.assertCareSpaceMember(reminder.careSpaceId, actorId);
    const triggeredAt = new Date().toISOString();
    const triggered = await this.reminders.update(reminderId, {
      status: "triggered",
      triggeredAt,
    });

    await this.events.publish({
      type: "ReminderTriggered",
      careSpaceId: triggered.careSpaceId,
      reminderId: triggered.id,
      title: triggered.title,
      triggeredAt,
      occurredAt: triggeredAt,
    });

    return triggered;
  }

  async listReminders(actorId: string, filters: CareReminderListFilters): Promise<CareReminder[]> {
    await this.tasks.assertCareSpaceMember(filters.careSpaceId, actorId);
    return this.reminders.list(filters);
  }
}
