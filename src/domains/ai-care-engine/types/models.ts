import type { PlatformCareContext } from "@/shared/ai/types";

export interface AssistantChatInput {
  careSpaceId: string;
  question: string;
}

export interface AssistantSource {
  type: string;
  id: string;
}

export interface AssistantAnswer {
  answer: string;
  sources: AssistantSource[];
  confidence: number;
}

export interface AssistantAgentInput {
  question: string;
  context: PlatformCareContext;
}

export interface BriefingInput {
  careSpaceId: string;
}

export interface DailyBriefing {
  todayPriorities: string[];
  upcomingAppointments: string[];
  overdueTasks: string[];
  importantChanges: string[];
  generatedAt: string;
}

export interface BriefingAgentInput {
  context: PlatformCareContext;
}
