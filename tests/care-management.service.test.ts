import { describe, expect, it, vi } from "vitest";

import { CareManagementService } from "@/domains/care-management/services/care-management.service";
import type {
  CareTaskRepository,
  ReminderRepository,
} from "@/domains/care-management/types/repositories";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";
const assigneeId = "33333333-3333-4333-8333-333333333333";
const taskId = "44444444-4444-4444-8444-444444444444";
const reminderId = "55555555-5555-4555-8555-555555555555";

function buildService() {
  const tasks: CareTaskRepository = {
    assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockImplementation(async (input) => ({
      id: taskId,
      careSpaceId: input.careSpaceId,
      title: input.title,
      description: input.description ?? null,
      status: "pending",
      priority: input.priority ?? "medium",
      assignedTo: input.assignedTo ?? null,
      createdBy: input.createdBy,
      dueAt: input.dueAt ?? null,
      completedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    })),
    findById: vi.fn().mockResolvedValue({
      id: taskId,
      careSpaceId,
      title: "Confirm transport",
      description: null,
      status: "pending",
      priority: "high",
      assignedTo: assigneeId,
      createdBy: actorId,
      dueAt: null,
      completedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
    list: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockImplementation(async (_id, patch) => ({
      id: taskId,
      careSpaceId,
      title: patch.title ?? "Confirm transport",
      description: patch.description ?? null,
      status: patch.status ?? "pending",
      priority: patch.priority ?? "high",
      assignedTo: patch.assignedTo ?? assigneeId,
      createdBy: actorId,
      dueAt: patch.dueAt ?? null,
      completedAt: patch.completedAt ?? null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    })),
    delete: vi.fn(),
  };
  const reminders: ReminderRepository = {
    create: vi.fn().mockResolvedValue({
      id: reminderId,
      careSpaceId,
      title: "Take medication",
      description: null,
      status: "scheduled",
      priority: "medium",
      scheduledFor: "2026-01-01T09:00:00.000Z",
      assignedTo: assigneeId,
      createdBy: actorId,
      triggeredAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
    findById: vi.fn().mockResolvedValue({
      id: reminderId,
      careSpaceId,
      title: "Take medication",
      description: null,
      status: "scheduled",
      priority: "medium",
      scheduledFor: "2026-01-01T09:00:00.000Z",
      assignedTo: assigneeId,
      createdBy: actorId,
      triggeredAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
    list: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockImplementation(async (_id, patch) => ({
      id: reminderId,
      careSpaceId,
      title: patch.title ?? "Take medication",
      description: patch.description ?? null,
      status: patch.status ?? "scheduled",
      priority: patch.priority ?? "medium",
      scheduledFor: patch.scheduledFor ?? "2026-01-01T09:00:00.000Z",
      assignedTo: patch.assignedTo ?? assigneeId,
      createdBy: actorId,
      triggeredAt: patch.triggeredAt ?? null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    })),
    delete: vi.fn(),
  };
  const events = { publish: vi.fn() };

  return { tasks, reminders, events, service: new CareManagementService(tasks, reminders, events) };
}

describe("CareManagementService", () => {
  it("creates assignable care tasks and publishes task events", async () => {
    const { tasks, events, service } = buildService();

    const task = await service.createTask(actorId, {
      careSpaceId,
      title: "Confirm transport",
      priority: "high",
      assignedTo: assigneeId,
    });

    expect(tasks.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(tasks.create).toHaveBeenCalledWith(
      expect.objectContaining({ careSpaceId, title: "Confirm transport", assignedTo: assigneeId }),
    );
    expect(task.status).toBe("pending");
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "TaskCreated" }));
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "TaskAssigned" }));
  });

  it("completes tasks only for care-space members and publishes completion", async () => {
    const { tasks, events, service } = buildService();

    const task = await service.completeTask(actorId, taskId);

    expect(tasks.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(tasks.update).toHaveBeenCalledWith(taskId, expect.objectContaining({ status: "completed" }));
    expect(task.status).toBe("completed");
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "TaskCompleted" }));
  });

  it("updates task details and validates a new assignee", async () => {
    const { tasks, events, service } = buildService();

    const task = await (service as unknown as {
      updateTask: (actorId: string, taskId: string, patch: unknown) => Promise<{
        title: string;
        assignedTo: string | null;
      }>;
    }).updateTask(actorId, taskId, {
      title: "Confirm accessible transport",
      assignedTo: assigneeId,
      status: "in_progress",
    });

    expect(tasks.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(tasks.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, assigneeId);
    expect(tasks.update).toHaveBeenCalledWith(taskId, {
      title: "Confirm accessible transport",
      assignedTo: assigneeId,
      status: "in_progress",
      completedAt: null,
    });
    expect(task.assignedTo).toBe(assigneeId);
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "TaskUpdated" }));
  });

  it("deletes a task only for care-space members and publishes deletion", async () => {
    const { tasks, events, service } = buildService();
    const deleteTask = vi.fn().mockResolvedValue(undefined);
    (tasks as unknown as { delete: typeof deleteTask }).delete = deleteTask;

    await (service as unknown as {
      deleteTask: (actorId: string, taskId: string) => Promise<void>;
    }).deleteTask(actorId, taskId);

    expect(tasks.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(deleteTask).toHaveBeenCalledWith(taskId);
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "TaskDeleted" }));
  });

  it("updates reminder scheduling and publishes the reminder update", async () => {
    const { reminders, events, service } = buildService();
    const reminder = await (service as unknown as {
      updateReminder: (actorId: string, reminderId: string, patch: unknown) => Promise<{
        scheduledFor: string;
        status: string;
      }>;
    }).updateReminder(actorId, reminderId, {
      scheduledFor: "2026-01-01T10:00:00.000Z",
      status: "scheduled",
    });

    expect(reminders.update).toHaveBeenCalledWith(reminderId, {
      scheduledFor: "2026-01-01T10:00:00.000Z",
      status: "scheduled",
      triggeredAt: null,
    });
    expect(reminder.scheduledFor).toBe("2026-01-01T10:00:00.000Z");
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "ReminderUpdated" }));
  });

  it("deletes a reminder only for care-space members and publishes deletion", async () => {
    const { reminders, events, service } = buildService();
    const deleteReminder = vi.fn().mockResolvedValue(undefined);
    (reminders as unknown as { delete: typeof deleteReminder }).delete = deleteReminder;

    await (service as unknown as {
      deleteReminder: (actorId: string, reminderId: string) => Promise<void>;
    }).deleteReminder(actorId, reminderId);

    expect(deleteReminder).toHaveBeenCalledWith(reminderId);
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "ReminderDeleted" }));
  });
});
