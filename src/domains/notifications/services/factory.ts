import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuditEventPublisher, AuditLogService, SupabaseAuditLogRepository } from "@/shared/audit";
import { CompositeEventPublisher, LoggingEventPublisher } from "@/shared/events/event-publisher";
import { SupabaseRealtimeGateway } from "@/shared/realtime/realtime-gateway";
import { SupabaseTimelineRepository, TimelineEventPublisher, TimelineService } from "@/domains/timeline";

import { NotificationController } from "../controllers/notification.controller";
import { SupabaseNotificationRepository } from "../repositories/notification.repository";
import { NotificationService } from "./notification.service";

export function createNotificationService(): NotificationService {
  const supabase = createSupabaseServerClient();
  const timeline = new TimelineService(new SupabaseTimelineRepository(supabase));
  const events = new CompositeEventPublisher([
    new LoggingEventPublisher(),
    new TimelineEventPublisher(timeline),
    new AuditEventPublisher(new AuditLogService(new SupabaseAuditLogRepository(supabase))),
  ]);

  return new NotificationService(
    new SupabaseNotificationRepository(supabase),
    new SupabaseRealtimeGateway(supabase),
    events,
  );
}

export function createNotificationController(): NotificationController {
  return new NotificationController(createNotificationService());
}
