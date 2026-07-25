import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AnalyticsController } from "../controllers/analytics.controller";
import { SupabaseAnalyticsRepository } from "../repositories/analytics.repository";
import { AnalyticsService } from "./analytics.service";

export function createAnalyticsController(): AnalyticsController {
  return new AnalyticsController(new AnalyticsService(new SupabaseAnalyticsRepository(createSupabaseServerClient())));
}
