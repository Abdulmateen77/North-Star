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
  /**
   * The AI-generated briefing, or `null` when it could not be produced (for
   * example when no OpenAI key is configured, or the model call failed).
   */
  dailyBriefing: DailyBriefing | null;
  /** True when `dailyBriefing` is null because generation failed. */
  briefingUnavailable: boolean;
}
