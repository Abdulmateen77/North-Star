import type { DomainEvent, DomainEventPublisher } from "@/shared/events/domain-events";

import type { CreateAuditLogInput } from "./models";
import type { AuditLogService } from "./audit-log.service";

type AuditActor = { actorId: string | null; sourceDomain: string; sourceId: string | null };

function actorAndSource(event: DomainEvent): AuditActor {
  switch (event.type) {
    case "TaskCreated":
      return { actorId: event.createdBy, sourceDomain: "care-management", sourceId: event.taskId };
    case "TaskAssigned":
      return { actorId: event.assignedBy, sourceDomain: "care-management", sourceId: event.taskId };
    case "TaskCompleted":
      return { actorId: event.completedBy, sourceDomain: "care-management", sourceId: event.taskId };
    case "ReminderCreated":
      return { actorId: event.createdBy, sourceDomain: "care-management", sourceId: event.reminderId };
    case "ReminderTriggered":
      return { actorId: null, sourceDomain: "care-management", sourceId: event.reminderId };
    case "ReminderMissed":
      return { actorId: null, sourceDomain: "care-management", sourceId: event.reminderId };
    case "AppointmentCreated":
      return { actorId: event.createdBy, sourceDomain: "care-management", sourceId: event.appointmentId };
    case "AppointmentCompleted":
      return { actorId: event.completedBy, sourceDomain: "care-management", sourceId: event.appointmentId };
    case "FamilyMemberInvited":
      return { actorId: event.invitedBy, sourceDomain: "collaboration", sourceId: event.invitationId };
    case "InvitationAccepted":
      return { actorId: event.acceptedBy, sourceDomain: "collaboration", sourceId: event.invitationId };
    case "CommentCreated":
      return { actorId: event.createdBy, sourceDomain: "collaboration", sourceId: event.commentId };
    case "NotificationSent":
      return { actorId: null, sourceDomain: "notifications", sourceId: event.notificationId };
    case "TimelineEventCreated":
      return { actorId: null, sourceDomain: "timeline", sourceId: event.timelineEventId };
    case "DocumentUploaded":
      return { actorId: event.uploadedBy, sourceDomain: "health-records", sourceId: event.documentId };
    case "DocumentAnalyzed":
    case "MedicalRecordCreated":
    case "AppointmentDetected":
    case "MedicationDetected":
      return { actorId: null, sourceDomain: "health-records", sourceId: event.documentId };
    case "DocumentDeleted":
      return { actorId: event.deletedBy, sourceDomain: "health-records", sourceId: event.documentId };
  }
}

export function mapDomainEventToAuditLogInput(event: DomainEvent): CreateAuditLogInput {
  const actor = actorAndSource(event);

  return {
    careSpaceId: event.careSpaceId,
    actorId: actor.actorId,
    action: event.type,
    sourceDomain: actor.sourceDomain,
    sourceId: actor.sourceId,
    metadata: { ...event },
    createdAt: event.occurredAt,
  };
}

export class AuditEventPublisher implements DomainEventPublisher {
  constructor(private readonly auditLogService: Pick<AuditLogService, "record">) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.auditLogService.record(mapDomainEventToAuditLogInput(event));
  }
}
