/**
 * The single seam between the UI and its data.
 *
 * Every screen reads care data through these functions and nothing else — no
 * component imports `./mock` directly. Each one is already async, so replacing
 * a body with a `fetch` against `/api/...` is a local change that needs no
 * edits in the UI layer.
 *
 * Example of the eventual swap:
 *
 *   export async function getCareTasks(): Promise<CareTask[]> {
 *     const res = await fetch(`${apiBase}/api/care-spaces/${id}/tasks`, {
 *       headers: { Authorization: `Bearer ${token}` },
 *     });
 *     if (!res.ok) throw await toApiError(res);
 *     return res.json();
 *   }
 *
 * Note the backend only models User / CareSpace / CareMember today, so most of
 * these have no endpoint behind them yet. `src/data/types.ts` documents the
 * shape each one is expected to return.
 */

import * as mock from "./mock";
import type {
  Appointment,
  CareDocument,
  CarePerson,
  CareReceiver,
  CareTask,
  ChatMessage,
  EmergencyContact,
  FamilyUpdate,
  HealthMetric,
  Insight,
  Medication,
  MedicationDose,
  Reminder,
  TimelineEvent,
} from "./types";

/* --- People --------------------------------------------------------------- */

export async function getCareReceiver(): Promise<CareReceiver> {
  return mock.careReceiver;
}

export async function getCaregivers(): Promise<CarePerson[]> {
  return mock.caregivers;
}

export async function getCurrentUser(): Promise<CarePerson> {
  return mock.currentUser;
}

/* --- Medications ---------------------------------------------------------- */

export async function getMedications(): Promise<Medication[]> {
  return mock.medications;
}

export async function getTodaysDoses(): Promise<MedicationDose[]> {
  return mock.todaysDoses;
}

/* --- Tasks ---------------------------------------------------------------- */

export async function getCareTasks(): Promise<CareTask[]> {
  return mock.careTasks;
}

/* --- Scheduling ----------------------------------------------------------- */

export async function getAppointments(): Promise<Appointment[]> {
  return mock.appointments;
}

export async function getReminders(): Promise<Reminder[]> {
  return mock.reminders;
}

/* --- Timeline & documents ------------------------------------------------- */

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  // Newest first — the UI relies on this ordering rather than sorting again.
  return [...mock.timelineEvents].sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );
}

export async function getCareDocuments(): Promise<CareDocument[]> {
  return [...mock.careDocuments].sort(
    (a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt),
  );
}

/* --- Assistant ------------------------------------------------------------ */

export async function getAssistantConversation(): Promise<ChatMessage[]> {
  return mock.assistantConversation;
}

export async function getAssistantSuggestions(): Promise<string[]> {
  return mock.assistantSuggestions;
}

/* --- Insights ------------------------------------------------------------- */

export async function getInsights(): Promise<Insight[]> {
  return mock.insights;
}

export async function getHealthMetrics(): Promise<HealthMetric[]> {
  return mock.healthMetrics;
}

/* --- Family --------------------------------------------------------------- */

export async function getFamilyUpdates(): Promise<FamilyUpdate[]> {
  return mock.familyUpdates;
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return mock.emergencyContacts;
}

/* --- Lookup helper -------------------------------------------------------- */

export { findPerson } from "./mock";
