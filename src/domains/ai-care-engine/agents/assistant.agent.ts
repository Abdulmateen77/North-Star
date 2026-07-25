import type { PromptRegistry } from "@/shared/ai/types";

import { createLazyChatClient, parseJsonContent, type ChatClient } from "./openai-json";
import type { AssistantAgentPort } from "../types/agents";
import type { AssistantAgentInput, AssistantAnswer } from "../types/models";

export class AssistantAgent implements AssistantAgentPort {
  constructor(
    private readonly prompts: PromptRegistry,
    private readonly client: ChatClient = createLazyChatClient(),
    private readonly model = "gpt-4o-mini",
  ) {}

  async answer(input: AssistantAgentInput): Promise<AssistantAnswer> {
    const fallback: AssistantAnswer = {
      answer: "I do not have enough North Star context to answer that safely.",
      sources: [],
      confidence: 0,
    };
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: this.prompts.getPrompt("assistant") },
        { role: "user", content: JSON.stringify(input) },
      ],
    });
    return parseJsonContent<AssistantAnswer>(completion.choices?.[0]?.message?.content, fallback);
  }
}
