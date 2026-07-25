import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StaticPromptRegistry } from "@/shared/ai/prompt-registry";
import { SupabaseContextRetriever } from "@/shared/ai/context-retriever";
import { BriefingAgent, BriefingService } from "@/domains/ai-care-engine";

import { DashboardController } from "../controllers/dashboard.controller";
import { SupabaseDashboardRepository } from "../repositories/dashboard.repository";
import { DashboardAggregator } from "./dashboard-aggregator.service";

export function createDashboardController(): DashboardController {
  const supabase = createSupabaseServerClient();
  const briefing = new BriefingService(new SupabaseContextRetriever(supabase), new BriefingAgent(new StaticPromptRegistry()));
  return new DashboardController(new DashboardAggregator(new SupabaseDashboardRepository(supabase), briefing));
}
