import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuditEventPublisher, AuditLogService, SupabaseAuditLogRepository } from "@/shared/audit";
import { CompositeEventPublisher, LoggingEventPublisher } from "@/shared/events/event-publisher";
import { SupabaseTimelineRepository, TimelineEventPublisher, TimelineService } from "@/domains/timeline";

import { CareManagementController } from "../controllers/care-management.controller";
import {
  SupabaseCareTaskRepository,
  SupabaseReminderRepository,
} from "../repositories/care-management.repository";
import { CareManagementService } from "./care-management.service";

export function createCareManagementService(): CareManagementService {
  const supabase = createSupabaseServerClient();
  const timeline = new TimelineService(new SupabaseTimelineRepository(supabase));
  const events = new CompositeEventPublisher([
    new LoggingEventPublisher(),
    new TimelineEventPublisher(timeline),
    new AuditEventPublisher(new AuditLogService(new SupabaseAuditLogRepository(supabase))),
  ]);

  return new CareManagementService(
    new SupabaseCareTaskRepository(supabase),
    new SupabaseReminderRepository(supabase),
    events,
  );
}

export function createCareManagementController(): CareManagementController {
  return new CareManagementController(createCareManagementService());
}
