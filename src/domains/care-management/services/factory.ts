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
import { ReminderSchedulerService } from "./reminder-scheduler.service";

function createCareManagementGraph() {
  const supabase = createSupabaseServerClient();
  const reminderRepository = new SupabaseReminderRepository(supabase);
  const timeline = new TimelineService(new SupabaseTimelineRepository(supabase));
  const events = new CompositeEventPublisher([
    new LoggingEventPublisher(),
    new TimelineEventPublisher(timeline),
    new AuditEventPublisher(new AuditLogService(new SupabaseAuditLogRepository(supabase))),
  ]);

  return {
    service: new CareManagementService(
      new SupabaseCareTaskRepository(supabase),
      reminderRepository,
      events,
    ),
    scheduler: new ReminderSchedulerService(reminderRepository, events),
  };
}

export function createCareManagementService(): CareManagementService {
  return createCareManagementGraph().service;
}

export function createCareManagementController(): CareManagementController {
  const graph = createCareManagementGraph();
  return new CareManagementController(graph.service, graph.scheduler);
}
