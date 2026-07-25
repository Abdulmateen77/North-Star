import type { PromptRegistry } from "./types";

const prompts: Record<string, string> = {
  assistant:
    "Answer caregiver questions using only retrieved North Star platform context. Never answer from memory alone. If context is insufficient, say what is missing. Return JSON only.",
  briefing:
    "Generate a concise daily caregiving briefing from tasks, appointments, reminders, and timeline events. No diagnosis. Return JSON only.",
  planning:
    "Convert structured medical context into caregiver coordination suggestions without creating medical advice. Return JSON only.",
};

export class StaticPromptRegistry implements PromptRegistry {
  getPrompt(name: string): string {
    return prompts[name] ?? "Return JSON only.";
  }
}
