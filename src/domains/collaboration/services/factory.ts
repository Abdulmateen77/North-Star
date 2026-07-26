import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuditEventPublisher, AuditLogService, SupabaseAuditLogRepository } from "@/shared/audit";
import { CompositeEventPublisher, LoggingEventPublisher } from "@/shared/events/event-publisher";
import { SupabaseTimelineRepository, TimelineEventPublisher, TimelineService } from "@/domains/timeline";

import { CollaborationController } from "../controllers/collaboration.controller";
import { SupabaseActivityRepository, SupabaseCommentRepository, SupabaseInvitationRepository, SupabasePermissionRepository } from "../repositories/collaboration.repository";
import { ActivityService } from "./activity.service";
import { CommentService } from "./comment.service";
import { InvitationService } from "./invitation.service";
import { PermissionService } from "./permission.service";

export function createCollaborationController(): CollaborationController {
  const supabase = createSupabaseServerClient();
  const timeline = new TimelineService(new SupabaseTimelineRepository(supabase));
  const events = new CompositeEventPublisher([
    new LoggingEventPublisher(),
    new TimelineEventPublisher(timeline),
    new AuditEventPublisher(new AuditLogService(new SupabaseAuditLogRepository(supabase))),
  ]);
  return new CollaborationController(
    new InvitationService(new SupabaseInvitationRepository(supabase), events),
    new PermissionService(new SupabasePermissionRepository(supabase)),
    new ActivityService(new SupabaseActivityRepository(supabase)),
    new CommentService(new SupabaseCommentRepository(supabase), events),
  );
}
