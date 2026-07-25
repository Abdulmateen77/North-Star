import { createOpenAIClient } from "@/lib/openai/client";

export interface ChatClient {
  chat: { completions: { create(input: Record<string, unknown>): Promise<{ choices?: Array<{ message?: { content?: string | null } }> }> } };
}

export function createLazyChatClient(): ChatClient {
  return {
    chat: {
      completions: {
        create: (input) => createOpenAIClient().chat.completions.create(input as never) as never,
      },
    },
  };
}

export function parseJsonContent<T>(content: string | null | undefined, fallback: T): T {
  if (!content) return fallback;
  try {
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}
