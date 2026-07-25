import type { ContextRetriever } from "@/shared/ai/types";

import type { BriefingAgentPort } from "../types/agents";
import type { BriefingInput, DailyBriefing } from "../types/models";

export class BriefingService {
  constructor(
    private readonly contextRetriever: ContextRetriever,
    private readonly agent: BriefingAgentPort,
  ) {}

  async generateDailyBriefing(actorId: string, input: BriefingInput): Promise<DailyBriefing> {
    await this.contextRetriever.assertCareSpaceMember(input.careSpaceId, actorId);
    const context = await this.contextRetriever.retrieve(input.careSpaceId);
    return this.agent.generate({ context });
  }
}
