import type { AssistantAgentInput, AssistantAnswer, BriefingAgentInput, DailyBriefing } from "./models";

export interface AssistantAgentPort {
  answer(input: AssistantAgentInput): Promise<AssistantAnswer>;
}

export interface BriefingAgentPort {
  generate(input: BriefingAgentInput): Promise<DailyBriefing>;
}
