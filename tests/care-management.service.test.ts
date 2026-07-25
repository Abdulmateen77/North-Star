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
      title: "Confirm transport",
      description: null,
      status: patch.status ?? "pending",
      priority: "high",
      assignedTo: assigneeId,
      createdBy: actorId,
      dueAt: null,
      completedAt: patch.completedAt ?? null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    })),
  };
  const reminders: ReminderRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
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
});
