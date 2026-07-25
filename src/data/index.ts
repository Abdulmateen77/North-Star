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

const emptyReceiver: CareReceiver = {
  id: "care-receiver-unset",
  fullName: "Care receiver",
  initials: "CR",
  relationship: "Care receiver",
  role: "care-receiver",
  avatarUrl: null,
  accent: "gold",
  age: 0,
  situation: "No care receiver profile has been added yet.",
  conditions: [],
  allergies: [],
  bloodType: null,
  nhsNumber: null,
};

const emptyUser: CarePerson = {
  id: "signed-in-caregiver",
  fullName: "Caregiver",
  initials: "CG",
  relationship: "You",
  role: "caregiver",
  avatarUrl: null,
  accent: "clay",
};

/* --- People --------------------------------------------------------------- */

export async function getCareReceiver(): Promise<CareReceiver> {
  return emptyReceiver;
}

export async function getCaregivers(): Promise<CarePerson[]> {
  return [emptyUser];
}

export async function getCurrentUser(): Promise<CarePerson> {
  return emptyUser;
}

/* --- Medications ---------------------------------------------------------- */

export async function getMedications(): Promise<Medication[]> {
  return [];
}

export async function getTodaysDoses(): Promise<MedicationDose[]> {
  return [];
}

/* --- Tasks ---------------------------------------------------------------- */

export async function getCareTasks(): Promise<CareTask[]> {
  return [];
}

/* --- Scheduling ----------------------------------------------------------- */

export async function getAppointments(): Promise<Appointment[]> {
  return [];
}

export async function getReminders(): Promise<Reminder[]> {
  return [];
}

/* --- Timeline & documents ------------------------------------------------- */

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  return [];
}

export async function getCareDocuments(): Promise<CareDocument[]> {
  return [];
}

/* --- Assistant ------------------------------------------------------------ */

export async function getAssistantConversation(): Promise<ChatMessage[]> {
  return [
    {
      id: "assistant-greeting",
      author: "assistant",
      body:
        "Ask me a question about this care space. I will answer from saved North Star records only.",
      timeLabel: "Now",
      citations: [],
      actions: [],
    },
  ];
}

export async function getAssistantSuggestions(): Promise<string[]> {
  return [
    "What tasks are outstanding?",
    "What reminders are coming up?",
    "Summarise the latest records.",
  ];
}

/* --- Insights ------------------------------------------------------------- */

export async function getInsights(): Promise<Insight[]> {
  return [];
}

export async function getHealthMetrics(): Promise<HealthMetric[]> {
  return [];
}

/* --- Family --------------------------------------------------------------- */

export async function getFamilyUpdates(): Promise<FamilyUpdate[]> {
  return [];
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return [];
}

/* --- Lookup helper -------------------------------------------------------- */

export function findPerson(_id: string | null): CarePerson | null {
  return null;
}
