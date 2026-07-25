export interface PlatformCareContext {
  documents: unknown[];
  appointments: unknown[];
  medications: unknown[];
  tasks: unknown[];
  reminders: unknown[];
  timeline: unknown[];
}

export interface ContextRetriever {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  retrieve(careSpaceId: string): Promise<PlatformCareContext>;
}

export interface PromptRegistry {
  getPrompt(name: string): string;
}
