import { describe, expect, it, vi } from "vitest";

import { unauthorized } from "@/lib/errors";
import { ReminderSchedulerService } from "@/domains/care-management/services/reminder-scheduler.service";
import type { CareReminder } from "@/domains/care-management/types/models";
import { requireCronSecret } from "@/shared/security/cron-auth";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const reminderId = "33333333-3333-4333-8333-333333333333";
const now = "2026-01-02T12:00:00.000Z";

function reminder(overrides: Partial<CareReminder> = {}): CareReminder {
  return {
    id: reminderId,
    careSpaceId,
    title: "Take morning medication",
    description: null,
    status: "scheduled",
    priority: "high",
    scheduledFor: "2026-01-02T11:55:00.000Z",
    assignedTo: "44444444-4444-4444-8444-444444444444",
    createdBy: "11111111-1111-4111-8111-111111111111",
    triggeredAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ReminderSchedulerService", () => {
  it("triggers due reminders and publishes reminder-triggered events", async () => {
    const dueReminder = reminder();
    const repository = {
      findDue: vi.fn().mockResolvedValue([dueReminder]),
      update: vi.fn().mockImplementation(async (_id, patch) => ({
        ...dueReminder,
        ...patch,
        updatedAt: now,
      })),
    };
    const events = { publish: vi.fn() };
    const service = new ReminderSchedulerService(repository, events, {
      missedAfterMs: 60 * 60 * 1000,
    });

    const result = await service.processDueReminders({ now, limit: 10 });

    expect(repository.findDue).toHaveBeenCalledWith(now, 10);
    expect(repository.update).toHaveBeenCalledWith(reminderId, {
      status: "triggered",
      triggeredAt: now,
    });
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ReminderTriggered",
        careSpaceId,
        reminderId,
        triggeredAt: now,
      }),
    );
    expect(result.triggered).toHaveLength(1);
    expect(result.missed).toHaveLength(0);
    expect(result.processedCount).toBe(1);
  });

  it("marks stale due reminders as missed and publishes reminder-missed events", async () => {
    const staleReminder = reminder({ scheduledFor: "2026-01-01T00:00:00.000Z" });
    const repository = {
      findDue: vi.fn().mockResolvedValue([staleReminder]),
      update: vi.fn().mockImplementation(async (_id, patch) => ({
        ...staleReminder,
        ...patch,
        updatedAt: now,
      })),
    };
    const events = { publish: vi.fn() };
    const service = new ReminderSchedulerService(repository, events, {
      missedAfterMs: 60 * 60 * 1000,
    });

    const result = await service.processDueReminders({ now, limit: 10 });

    expect(repository.update).toHaveBeenCalledWith(reminderId, { status: "missed" });
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ReminderMissed",
        careSpaceId,
        reminderId,
        missedAt: now,
      }),
    );
    expect(result.triggered).toHaveLength(0);
    expect(result.missed).toHaveLength(1);
    expect(result.processedCount).toBe(1);
  });
});

describe("cron secret auth", () => {
  it("accepts the configured cron secret from the x-cron-secret header", () => {
    const request = new Request("http://localhost/api/care-management/reminders/process-due", {
      method: "POST",
      headers: { "x-cron-secret": "test-secret" },
    });

    expect(() => requireCronSecret(request, "test-secret")).not.toThrow();
  });

  it("rejects requests with a missing or invalid cron secret", () => {
    const request = new Request("http://localhost/api/care-management/reminders/process-due", {
      method: "POST",
    });

    expect(() => requireCronSecret(request, "test-secret")).toThrow(unauthorized("Invalid cron secret."));
  });
});
