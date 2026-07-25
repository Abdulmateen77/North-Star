import { createSupabaseServerClient } from "@/lib/supabase/server";

import { TimelineController } from "../controllers/timeline.controller";
import { SupabaseTimelineRepository } from "../repositories/timeline.repository";
import { TimelineService } from "./timeline.service";

export function createTimelineService(): TimelineService {
  return new TimelineService(new SupabaseTimelineRepository(createSupabaseServerClient()));
}

export function createTimelineController(): TimelineController {
  return new TimelineController(createTimelineService());
}
