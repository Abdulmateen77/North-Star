import type { PromptRegistry } from "@/shared/ai/types";

import { createLazyChatClient, parseJsonContent, type ChatClient } from "./openai-json";
import type { BriefingAgentPort } from "../types/agents";
import type { BriefingAgentInput, DailyBriefing } from "../types/models";

export class BriefingAgent implements BriefingAgentPort {
  constructor(
    private readonly prompts: PromptRegistry,
    private readonly client: ChatClient = createLazyChatClient(),
    private readonly model = "gpt-4o-mini",
  ) {}

  async generate(input: BriefingAgentInput): Promise<DailyBriefing> {
    const fallback: DailyBriefing = {
      todayPriorities: [],
      upcomingAppointments: [],
      overdueTasks: [],
      importantChanges: [],
      generatedAt: new Date().toISOString(),
    };
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: this.prompts.getPrompt("briefing") },
        { role: "user", content: JSON.stringify(input) },
      ],
    });
    return parseJsonContent<DailyBriefing>(completion.choices?.[0]?.message?.content, fallback);
  }
}
