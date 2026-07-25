import type { ContextRetriever } from "@/shared/ai/types";

import type { AssistantAgentPort } from "../types/agents";
import type { AssistantAnswer, AssistantChatInput } from "../types/models";

export class AssistantService {
  constructor(
    private readonly contextRetriever: ContextRetriever,
    private readonly agent: AssistantAgentPort,
  ) {}

  async chat(actorId: string, input: AssistantChatInput): Promise<AssistantAnswer> {
    await this.contextRetriever.assertCareSpaceMember(input.careSpaceId, actorId);
    const context = await this.contextRetriever.retrieve(input.careSpaceId);
    return this.agent.answer({ question: input.question, context });
  }
}
