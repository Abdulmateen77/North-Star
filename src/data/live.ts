import type { CareSpace, User } from "@/domain/models";
import { api as defaultApi } from "@/lib/api-client";

import {
  toCareReminder,
  toCareTask,
  type BackendCareReminder,
  type BackendCareTask,
} from "./adapters";
import type { CarePerson, CareTask, ChatMessage, Reminder } from "./types";

export interface ApiTransport {
  get<T>(path: string): Promise<T>;
  post?<T>(path: string, body?: unknown): Promise<T>;
}

interface UserResponse {
  user: User;
}

interface CareSpacesResponse {
  careSpaces: CareSpace[];
}

interface TasksResponse {
  tasks: BackendCareTask[];
}

interface TaskResponse {
  task: BackendCareTask;
}

interface RemindersResponse {
  reminders: BackendCareReminder[];
}

interface ReminderResponse {
  reminder: BackendCareReminder;
}

interface AssistantResponse {
  answer: string;
  sources: Array<{ type: string; id: string }>;
  confidence: number;
}

export interface LiveCareBootstrap {
  careSpaceId: string;
  careSpaceName: string;
  currentUser: CarePerson;
  tasks: CareTask[];
  reminders: Reminder[];
}

const accents: CarePerson["accent"][] = ["clay", "olive", "gold", "peach"];

function requirePost(transport: ApiTransport): NonNullable<ApiTransport["post"]> {
  if (transport.post === undefined) {
    throw new Error("API transport does not support writes.");
  }
  return transport.post.bind(transport);
}

function initialsFor(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "NS";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();

  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function toCarePerson(user: User, index = 0): CarePerson {
  const fullName = user.fullName ?? user.email.split("@")[0] ?? "Caregiver";

  return {
    id: user.id,
    fullName,
    initials: initialsFor(fullName),
    relationship: "You",
    role: "caregiver",
    avatarUrl: user.avatarUrl,
    accent: accents[index % accents.length]!,
  };
}

export async function loadLiveCareBootstrap(
  transport: ApiTransport = defaultApi,
  now: Date = new Date(),
): Promise<LiveCareBootstrap | null> {
  const [{ user }, { careSpaces }] = await Promise.all([
    transport.get<UserResponse>("/api/users/me"),
    transport.get<CareSpacesResponse>("/api/care-spaces"),
  ]);

  const activeCareSpace = careSpaces[0] ?? null;
  if (activeCareSpace === null) {
    return null;
  }

  const careSpaceParam = encodeURIComponent(activeCareSpace.id);
  const [{ tasks }, { reminders }] = await Promise.all([
    transport.get<TasksResponse>(`/api/care-management/tasks?careSpaceId=${careSpaceParam}`),
    transport.get<RemindersResponse>(`/api/care-management/reminders?careSpaceId=${careSpaceParam}`),
  ]);

  return {
    careSpaceId: activeCareSpace.id,
    careSpaceName: activeCareSpace.name,
    currentUser: toCarePerson(user),
    tasks: tasks.map((task) => toCareTask(task, now)),
    reminders: reminders.map(toCareReminder),
  };
}

function dueLabelToDueAt(label: string): string | null {
  const due = new Date();
  if (label === "Tomorrow") due.setDate(due.getDate() + 1);
  if (label === "This week") due.setDate(due.getDate() + 7);
  if (!["Today", "Tomorrow", "This week"].includes(label)) return null;
  due.setHours(17, 0, 0, 0);
  return due.toISOString();
}

function timeLabelToScheduledFor(label: string): string {
  const match = label.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  const scheduled = new Date();

  if (match) {
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const meridiem = match[3]!.toLowerCase();
    const hour24 = meridiem === "pm" ? (hour % 12) + 12 : hour % 12;
    scheduled.setHours(hour24, minute, 0, 0);
  } else {
    scheduled.setHours(scheduled.getHours() + 1, 0, 0, 0);
  }

  if (scheduled.getTime() <= Date.now()) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduled.toISOString();
}

export async function createLiveTask(
  careSpaceId: string,
  task: CareTask,
  transport: ApiTransport = defaultApi,
): Promise<CareTask> {
  const post = requirePost(transport);
  const response = await post<TaskResponse>("/api/care-management/tasks", {
    careSpaceId,
    title: task.title,
    description: task.detail,
    priority: task.priority,
    assignedTo: task.assigneeId,
    dueAt: dueLabelToDueAt(task.dueLabel),
  });
  return toCareTask(response.task);
}

export async function completeLiveTask(
  id: string,
  transport: ApiTransport = defaultApi,
): Promise<CareTask> {
  const post = requirePost(transport);
  const response = await post<TaskResponse>(`/api/care-management/tasks/${encodeURIComponent(id)}/complete`);
  return toCareTask(response.task);
}

export async function createLiveReminder(
  careSpaceId: string,
  reminder: Reminder,
  transport: ApiTransport = defaultApi,
): Promise<Reminder> {
  const post = requirePost(transport);
  const response = await post<ReminderResponse>("/api/care-management/reminders", {
    careSpaceId,
    title: reminder.title,
    description: reminder.repeatLabel,
    priority: "medium",
    scheduledFor: timeLabelToScheduledFor(reminder.timeLabel),
  });
  return toCareReminder(response.reminder);
}

export async function askLiveAssistant(
  careSpaceId: string,
  question: string,
  transport: ApiTransport = defaultApi,
): Promise<ChatMessage> {
  const post = requirePost(transport);
  const response = await post<AssistantResponse>("/api/assistant/chat", { careSpaceId, question });
  const now = new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

  return {
    id: `assistant-${Date.now()}`,
    author: "assistant",
    body: response.answer,
    timeLabel: now,
    citations: response.sources.map((source) => ({
      label: source.type,
      documentId: source.type === "document" ? source.id : null,
    })),
    actions: [],
  };
}
