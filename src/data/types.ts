/**
 * Frontend-facing care domain types.
 *
 * The backend currently models `User`, `CareSpace` and `CareMember` only
 * (see `src/domain/models.ts`) — those are re-exported here so the UI speaks
 * exactly one vocabulary. Everything below them describes surfaces the UI
 * needs today and the API is expected to grow into. Field names deliberately
 * mirror the backend's existing conventions (camelCase, ISO date strings,
 * `id` primary keys) so swapping mock data for live data is a transport
 * change rather than a rewrite.
 */

export type { CareMember, CareMemberRole, CareSpace, User } from "@/domain/models";

/* -------------------------------------------------------------------------- */
/* People                                                                      */
/* -------------------------------------------------------------------------- */

/** A person shown in the UI — caregiver or care receiver. */
export interface CarePerson {
  id: string;
  fullName: string;
  /** Rendered in avatars when there's no photo. */
  initials: string;
  /** How this person relates to the care receiver, e.g. "Daughter". */
  relationship: string;
  role: "owner" | "caregiver" | "viewer" | "care-receiver";
  avatarUrl: string | null;
  /** Tailwind-ready accent token, used to keep a person's colour consistent. */
  accent: PersonAccent;
}

export type PersonAccent = "clay" | "olive" | "gold" | "peach";

/** The person being cared for. */
export interface CareReceiver extends CarePerson {
  role: "care-receiver";
  age: number;
  /** Short human summary, e.g. "Recovering from hip replacement". */
  situation: string;
  conditions: string[];
  allergies: string[];
  bloodType: string | null;
  nhsNumber: string | null;
}

/* -------------------------------------------------------------------------- */
/* Medications                                                                 */
/* -------------------------------------------------------------------------- */

export type MedicationTiming = "morning" | "midday" | "evening" | "night" | "as-needed";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  /** Plain-English instruction, e.g. "With breakfast". */
  instruction: string;
  timings: MedicationTiming[];
  /** What this is for, in words a family understands. */
  purpose: string;
  prescribedBy: string;
  startedAt: string;
  /** Set when a clinician changed dose or stopped the drug. */
  changedNote: string | null;
  refillsRemaining: number;
  /** Low stock drives a gentle nudge on the dashboard. */
  daysSupplyLeft: number;
}

/** A single scheduled dose on a given day. */
export interface MedicationDose {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  timing: MedicationTiming;
  /** Display time, e.g. "8:00am". */
  scheduledFor: string;
  status: DoseStatus;
  takenAt: string | null;
}

export type DoseStatus = "taken" | "due" | "upcoming" | "missed" | "skipped";

/* -------------------------------------------------------------------------- */
/* Tasks                                                                       */
/* -------------------------------------------------------------------------- */

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "high" | "medium" | "low";
export type TaskCategory =
  | "medication"
  | "appointment"
  | "admin"
  | "daily-living"
  | "wellbeing";

export interface CareTask {
  id: string;
  title: string;
  detail: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  /** `CarePerson.id`, or null when nobody has picked it up yet. */
  assigneeId: string | null;
  dueLabel: string;
  /** True when the AI created this from a document rather than a human. */
  generatedByAi: boolean;
  /** Which document it came from, when AI-generated. */
  sourceDocumentId: string | null;
  completedAt: string | null;
}

/* -------------------------------------------------------------------------- */
/* Appointments & reminders                                                    */
/* -------------------------------------------------------------------------- */

export interface Appointment {
  id: string;
  title: string;
  clinician: string;
  location: string;
  /** ISO date string. */
  startsAt: string;
  /** Display helpers so the UI never re-derives formatting rules. */
  dateLabel: string;
  timeLabel: string;
  /** Who is taking them, by `CarePerson.id`. */
  escortId: string | null;
  notes: string | null;
  transport: string | null;
}

export type ReminderKind = "medication" | "appointment" | "hydration" | "movement" | "custom";

export interface Reminder {
  id: string;
  title: string;
  kind: ReminderKind;
  timeLabel: string;
  /** e.g. "Every day", "Weekdays". */
  repeatLabel: string;
  enabled: boolean;
  /** Whether the care receiver confirmed the last occurrence. */
  lastConfirmed: string | null;
}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

export type TimelineKind =
  | "appointment"
  | "medication-change"
  | "hospital"
  | "document"
  | "milestone"
  | "note";

export interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  title: string;
  summary: string;
  /** ISO date string — the source of truth for ordering. */
  occurredAt: string;
  dateLabel: string;
  /** Who logged it, by `CarePerson.id`; null when the AI derived it. */
  actorId: string | null;
  /** Set when this entry was extracted from an uploaded document. */
  sourceDocumentId: string | null;
  /** Marks the entries worth surfacing in a condensed view. */
  significant: boolean;
}

/* -------------------------------------------------------------------------- */
/* Documents                                                                   */
/* -------------------------------------------------------------------------- */

export type DocumentStatus = "uploading" | "analysing" | "ready" | "failed";
export type DocumentKind =
  | "discharge-summary"
  | "test-results"
  | "prescription"
  | "care-plan"
  | "letter"
  | "other";

export interface CareDocument {
  id: string;
  title: string;
  kind: DocumentKind;
  status: DocumentStatus;
  /** Source organisation, e.g. "NHS — Royal Free Hospital". */
  source: string;
  uploadedAt: string;
  dateLabel: string;
  fileName: string;
  fileSizeLabel: string;
  pageCount: number;
  /** Plain-English AI summary shown under the document. */
  aiSummary: string | null;
  /** Structured facts the AI pulled out, rendered as chips. */
  extractedFacts: ExtractedFact[];
  /** Ids of tasks the AI generated from this document. */
  generatedTaskIds: string[];
  /** 0–100 while `status` is `uploading` or `analysing`. */
  progress: number;
}

export interface ExtractedFact {
  label: string;
  value: string;
}

/* -------------------------------------------------------------------------- */
/* AI assistant                                                                */
/* -------------------------------------------------------------------------- */

export type ChatAuthor = "user" | "assistant";

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  /** Plain text. Rendered as paragraphs split on blank lines. */
  body: string;
  timeLabel: string;
  /** Documents/events the answer drew on, shown as provenance chips. */
  citations: ChatCitation[];
  /** Follow-up actions the assistant offers to take. */
  actions: ChatAction[];
}

export interface ChatCitation {
  label: string;
  documentId: string | null;
}

export interface ChatAction {
  id: string;
  label: string;
  kind: "create-task" | "create-reminder" | "open-document" | "share";
}

/* -------------------------------------------------------------------------- */
/* Insights & alerts                                                           */
/* -------------------------------------------------------------------------- */

export type InsightTone = "positive" | "attention" | "neutral";

export interface Insight {
  id: string;
  title: string;
  body: string;
  tone: InsightTone;
  /** Short metric shown large, e.g. "92%". */
  metric: string | null;
  metricLabel: string | null;
  /** Optional deep link target within the app. */
  href: string | null;
}

/* -------------------------------------------------------------------------- */
/* Health signals                                                              */
/* -------------------------------------------------------------------------- */

export type TrendDirection = "up" | "down" | "steady";

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  unit: string | null;
  /** Whether the movement is good, worth watching, or neutral. */
  tone: InsightTone;
  trend: TrendDirection;
  trendLabel: string;
  /** Normalised 0–1 series used to draw the sparkline. */
  series: number[];
}

/* -------------------------------------------------------------------------- */
/* Family                                                                      */
/* -------------------------------------------------------------------------- */

export interface FamilyUpdate {
  id: string;
  authorId: string;
  body: string;
  timeLabel: string;
  /** Reaction count, kept simple for the hackathon build. */
  acknowledgedBy: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  /** The one contact surfaced first on the patient's emergency screen. */
  primary: boolean;
}
