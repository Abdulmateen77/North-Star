import { describe, expect, it } from "vitest";

import {
  toCareTask,
  toDueLabel,
  toTimelineEvent,
  toUiPriority,
  toUiTaskStatus,
} from "@/data/adapters";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";

function backendTask(overrides: Record<string, unknown> = {}) {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    careSpaceId,
    title: "Book follow-up",
    description: "Call the clinic",
    status: "pending",
    priority: "high",
    assignedTo: actorId,
    createdBy: actorId,
    dueAt: null,
    completedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("backend -> UI status mapping", () => {
  it("maps every backend task status to a UI status", () => {
    expect(toUiTaskStatus("pending")).toBe("todo");
    expect(toUiTaskStatus("in_progress")).toBe("in-progress");
    expect(toUiTaskStatus("completed")).toBe("done");
    // The UI has no 'cancelled' column, so it reads as done rather than
    // silently vanishing from the board.
    expect(toUiTaskStatus("cancelled")).toBe("done");
  });

  it("collapses backend 'urgent' priority into the UI's high band", () => {
    expect(toUiPriority("low")).toBe("low");
    expect(toUiPriority("medium")).toBe("medium");
    expect(toUiPriority("high")).toBe("high");
    // The UI only models three priorities; urgent must not fall through to
    // undefined or the badge renders blank.
    expect(toUiPriority("urgent")).toBe("high");
  });
});

describe("due label formatting", () => {
  const now = new Date("2026-01-10T12:00:00.000Z");

  it("says 'No date' when a task has no due date", () => {
    expect(toDueLabel(null, now)).toBe("No date");
  });

  it("describes today, tomorrow, and overdue dates in human terms", () => {
    expect(toDueLabel("2026-01-10T18:00:00.000Z", now)).toBe("Today");
    expect(toDueLabel("2026-01-11T09:00:00.000Z", now)).toBe("Tomorrow");
    expect(toDueLabel("2026-01-09T09:00:00.000Z", now)).toBe("Overdue");
  });

  it("falls back to a short date for anything further out", () => {
    expect(toDueLabel("2026-02-14T09:00:00.000Z", now)).toMatch(/14 Feb/);
  });
});

describe("task adapter", () => {
  it("maps a backend task onto the shape the UI renders", () => {
    const task = toCareTask(backendTask(), new Date("2026-01-10T12:00:00.000Z"));

    expect(task).toMatchObject({
      id: "33333333-3333-4333-8333-333333333333",
      title: "Book follow-up",
      detail: "Call the clinic",
      status: "todo",
      priority: "high",
      assigneeId: actorId,
      dueLabel: "No date",
    });
  });

  it("defaults category and AI provenance, which the backend does not model yet", () => {
    const task = toCareTask(backendTask());

    // The frontend type requires these; the backend has no column for either.
    // They must be explicit defaults rather than undefined, or the UI crashes
    // on category lookups.
    expect(task.category).toBe("admin");
    expect(task.generatedByAi).toBe(false);
    expect(task.sourceDocumentId).toBeNull();
  });

  it("carries completion through so the UI can show it as done", () => {
    const task = toCareTask(
      backendTask({ status: "completed", completedAt: "2026-01-05T10:00:00.000Z" }),
    );

    expect(task.status).toBe("done");
    expect(task.completedAt).toBe("2026-01-05T10:00:00.000Z");
  });
});

describe("timeline adapter", () => {
  it("maps backend timeline events into the UI's timeline shape", () => {
    const event = toTimelineEvent({
      id: "44444444-4444-4444-8444-444444444444",
      careSpaceId,
      eventType: "TaskCreated",
      title: "Task created: Book follow-up",
      description: null,
      sourceDomain: "care-management",
      sourceId: "33333333-3333-4333-8333-333333333333",
      createdBy: actorId,
      createdAt: "2026-01-02T08:30:00.000Z",
      metadata: {},
    });

    expect(event).toMatchObject({
      id: "44444444-4444-4444-8444-444444444444",
      title: "Task created: Book follow-up",
      occurredAt: "2026-01-02T08:30:00.000Z",
      actorId,
    });
    expect(event.dateLabel).toMatch(/2 Jan/);
  });

  it("classifies document events distinctly from note events", () => {
    const documentEvent = toTimelineEvent({
      id: "55555555-5555-4555-8555-555555555555",
      careSpaceId,
      eventType: "DocumentUploaded",
      title: "Healthcare document uploaded",
      description: null,
      sourceDomain: "health-records",
      sourceId: "66666666-6666-4666-8666-666666666666",
      createdBy: actorId,
      createdAt: "2026-01-03T08:30:00.000Z",
      metadata: {},
    });

    expect(documentEvent.kind).toBe("document");
    expect(documentEvent.sourceDocumentId).toBe("66666666-6666-4666-8666-666666666666");
  });
});
