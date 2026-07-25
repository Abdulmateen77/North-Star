import type { DailyBriefing } from "@/domains/ai-care-engine/types/models";

export interface DashboardSnapshot {
  patient: unknown;
  carePlan: unknown;
  todayTasks: unknown[];
  upcomingAppointments: unknown[];
  reminders: unknown[];
  timeline: unknown[];
  alerts: unknown[];
  medicationStatus: unknown[];
  recentDocuments: unknown[];
  activityFeed: unknown[];
}

export interface DashboardResponse extends DashboardSnapshot {
  dailyBriefing: DailyBriefing;
}
