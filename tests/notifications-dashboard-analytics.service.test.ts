import { describe, expect, it, vi } from "vitest";

import { NotificationService } from "@/domains/notifications/services/notification.service";
import { DashboardAggregator } from "@/domains/dashboard/services/dashboard-aggregator.service";
import { AnalyticsService } from "@/domains/analytics/services/analytics.service";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";

describe("Notifications, Dashboard, and Analytics", () => {
  it("persists notifications, broadcasts realtime updates, and publishes delivery events", async () => {
    const repository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "99999999-9999-4999-8999-999999999999",
        ...input,
        readAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      })),
      list: vi.fn(),
      subscribe: vi.fn(),
    };
    const realtime = { broadcast: vi.fn().mockResolvedValue(undefined) };
    const events = { publish: vi.fn() };
    const service = new NotificationService(repository, realtime, events);

    const notification = await service.send(actorId, {
      careSpaceId,
      recipientId: actorId,
      title: "Task assigned",
      body: "Confirm transport",
      channel: "in_app",
    });

    expect(repository.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(realtime.broadcast).toHaveBeenCalledWith(
      `care-space:${careSpaceId}`,
      expect.objectContaining({ type: "notification.created" }),
    );
    expect(notification.title).toBe("Task assigned");
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "NotificationSent" }));
  });

  it("aggregates the caregiver dashboard with one read-model call plus briefing", async () => {
    const repository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      getDashboardSnapshot: vi.fn().mockResolvedValue({
        patient: { name: "Grandma" },
        carePlan: null,
        todayTasks: [{ title: "Confirm transport" }],
        upcomingAppointments: [],
        reminders: [],
        timeline: [],
        alerts: [],
        medicationStatus: [],
        recentDocuments: [],
        activityFeed: [],
      }),
    };
    const briefing = {
      generateDailyBriefing: vi.fn().mockResolvedValue({
        todayPriorities: ["Confirm transport"],
        upcomingAppointments: [],
        overdueTasks: [],
        importantChanges: [],
        generatedAt: "2026-01-01T00:00:00.000Z",
      }),
    };
    const service = new DashboardAggregator(repository, briefing);

    const dashboard = await service.getDashboard(actorId, careSpaceId);

    expect(repository.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(dashboard.dailyBriefing.todayPriorities).toEqual(["Confirm transport"]);
  });

  it("generates non-diagnostic structured care insights from observed platform data", async () => {
    const repository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      getAnalyticsSnapshot: vi.fn().mockResolvedValue({
        tasks: [
          { status: "completed", assignedTo: actorId },
          { status: "pending", assignedTo: actorId },
        ],
        reminders: [{ status: "missed" }],
        medications: [{ name: "Aspirin" }],
        appointments: [{ date: "2026-08-14" }],
        timeline: [{ eventType: "TaskCompleted" }],
      }),
    };
    const service = new AnalyticsService(repository);

    const result = await service.generateInsights(actorId, careSpaceId);

    expect(result.insights.some((insight) => insight.type === "task_completion_trend")).toBe(true);
    expect(result.insights.every((insight) => insight.diagnostic === false)).toBe(true);
  });
});
