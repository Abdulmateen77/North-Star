import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StaticPromptRegistry } from "@/shared/ai/prompt-registry";
import { SupabaseContextRetriever } from "@/shared/ai/context-retriever";

import { AssistantAgent } from "../agents/assistant.agent";
import { BriefingAgent } from "../agents/briefing.agent";
import { AICareEngineController } from "../controllers/ai-care-engine.controller";
import { AssistantService } from "./assistant.service";
import { BriefingService } from "./briefing.service";

export function createAICareEngineController(): AICareEngineController {
  const supabase = createSupabaseServerClient();
  const retriever = new SupabaseContextRetriever(supabase);
  const prompts = new StaticPromptRegistry();
  return new AICareEngineController(
    new AssistantService(retriever, new AssistantAgent(prompts)),
    new BriefingService(retriever, new BriefingAgent(prompts)),
  );
}
