/**
 * Translation layer between the backend's domain models and the shapes the UI
 * renders.
 *
 * The two vocabularies genuinely differ: the backend stores machine-facing data
 * (`status: "pending"`, `dueAt: ISO string`) while the UI wants display-ready
 * values (`status: "todo"`, `dueLabel: "Tomorrow"`). Keeping the mapping here
 * means no component has to know about backend enums, and no backend model has
 * to bend to presentation concerns.
 *
 * Where the frontend type requires a field the backend does not model yet
 * (task category, AI provenance), an explicit documented default is used rather
 * than leaving it undefined — the UI indexes into lookup tables by these values
 * and would otherwise render blank or crash.
 */
import type {
  CareTask,
  Reminder,
  ReminderKind,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TimelineEvent,
  TimelineKind,
} from "./types";

/* --- Backend shapes ------------------------------------------------------- */

export interface BackendCareTask {
  id: string;
  careSpaceId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: string | null;
  createdBy: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendTimelineEvent {
  id: string;
  careSpaceId: string;
  eventType: string;
  title: string;
  description: string | null;
  sourceDomain: string;
  sourceId: string | null;
  createdBy: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface BackendCareReminder {
  id: string;
  careSpaceId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledFor: string;
  assignedTo: string | null;
  createdBy: string;
  triggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* --- Status & priority ---------------------------------------------------- */

export function toUiTaskStatus(status: string): TaskStatus {
  switch (status) {
    case "in_progress":
      return "in-progress";
    case "completed":
      // 'cancelled' has no UI column of its own; treating it as done keeps it
      // visible in history instead of disappearing from the board.
      return "done";
    case "cancelled":
      return "done";
    default:
      return "todo";
  }
}

export function toBackendTaskStatus(status: TaskStatus): string {
  switch (status) {
    case "in-progress":
      return "in_progress";
    case "done":
      return "completed";
    default:
      return "pending";
  }
}

export function toUiPriority(priority: string): TaskPriority {
  switch (priority) {
    case "low":
      return "low";
    case "high":
    case "urgent":
      // The UI models three priorities; 'urgent' folds into its top band.
      return "high";
    default:
      return "medium";
  }
}

/* --- Dates ---------------------------------------------------------------- */

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** Human due-date copy: "Today", "Tomorrow", "Overdue", or "14 Feb". */
export function toDueLabel(dueAt: string | null, now: Date = new Date()): string {
  if (!dueAt) {
    return "No date";
  }

  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) {
    return "No date";
  }

  const dayDiff = Math.round((startOfDay(due) - startOfDay(now)) / 86_400_000);

  if (dayDiff < 0) return "Overdue";
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";

  return shortDate.format(due);
}

export function toDateLabel(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : shortDate.format(date);
}

/* --- Tasks ---------------------------------------------------------------- */

export function toCareTask(task: BackendCareTask, now: Date = new Date()): CareTask {
  return {
    id: task.id,
    title: task.title,
    detail: task.description,
    status: toUiTaskStatus(task.status),
    priority: toUiPriority(task.priority),
    // The backend has no category column yet; 'admin' is the neutral bucket.
    category: "admin" satisfies TaskCategory,
    assigneeId: task.assignedTo,
    dueLabel: toDueLabel(task.dueAt, now),
    // No AI-provenance column on care_tasks yet, so this is always false until
    // the AI care engine writes tasks directly.
    generatedByAi: false,
    sourceDocumentId: null,
    completedAt: task.completedAt,
  };
}

/* --- Reminders ------------------------------------------------------------ */

function toTimeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const suffix = hours < 12 ? "am" : "pm";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${minutes}${suffix}`;
}

export function toCareReminder(reminder: BackendCareReminder): Reminder {
  return {
    id: reminder.id,
    title: reminder.title,
    // The backend does not store reminder category/repeat cadence yet.
    kind: "custom" satisfies ReminderKind,
    timeLabel: toTimeLabel(reminder.scheduledFor),
    repeatLabel: "Once",
    enabled: reminder.status === "scheduled" || reminder.status === "triggered",
    lastConfirmed: reminder.triggeredAt === null ? null : "Confirmed",
  };
}

/* --- Timeline ------------------------------------------------------------- */

const timelineKindBySourceDomain: Record<string, TimelineKind> = {
  "health-records": "document",
  "care-management": "note",
  collaboration: "note",
  notifications: "note",
};

function toTimelineKind(event: BackendTimelineEvent): TimelineKind {
  if (event.eventType.startsWith("Document")) return "document";
  if (event.eventType.startsWith("Appointment")) return "appointment";
  if (event.eventType.startsWith("Medication")) return "medication-change";
  return timelineKindBySourceDomain[event.sourceDomain] ?? "note";
}

/** Events worth surfacing in a condensed view. */
const significantEventTypes = new Set([
  "DocumentAnalyzed",
  "AppointmentDetected",
  "MedicationDetected",
  "ReminderMissed",
  "InvitationAccepted",
]);

export function toTimelineEvent(event: BackendTimelineEvent): TimelineEvent {
  const kind = toTimelineKind(event);

  return {
    id: event.id,
    kind,
    title: event.title,
    summary: event.description ?? "",
    occurredAt: event.createdAt,
    dateLabel: toDateLabel(event.createdAt),
    actorId: event.createdBy,
    sourceDocumentId: kind === "document" ? event.sourceId : null,
    significant: significantEventTypes.has(event.eventType),
  };
}
