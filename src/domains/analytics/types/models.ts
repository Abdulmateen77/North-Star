export interface CareInsight {
  id: string;
  type: string;
  title: string;
  value: number | string;
  description: string;
  severity: "info" | "warning";
  diagnostic: false;
}

export interface AnalyticsSnapshot {
  tasks: Array<{ status?: string; assignedTo?: string | null }>;
  reminders: Array<{ status?: string }>;
  medications: Array<{ name?: string }>;
  appointments: Array<{ date?: string }>;
  timeline: Array<{ eventType?: string }>;
}

export interface AnalyticsInsightsResult {
  careSpaceId: string;
  generatedAt: string;
  insights: CareInsight[];
}
