import type { DomainEvent } from "@/shared/events/domain-events";

import type { CreateTimelineEventInput } from "../types/models";

export function mapDomainEventToTimelineInput(event: DomainEvent): CreateTimelineEventInput {
  switch (event.type) {
    case "TaskCreated":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `Task created: ${event.title}`,
        description: null,
        sourceDomain: "care-management",
        sourceId: event.taskId,
        createdBy: event.createdBy,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "TaskAssigned":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `Task assigned: ${event.title}`,
        description: null,
        sourceDomain: "care-management",
        sourceId: event.taskId,
        createdBy: event.assignedBy,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "TaskCompleted":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `Task completed: ${event.title}`,
        description: null,
        sourceDomain: "care-management",
        sourceId: event.taskId,
        createdBy: event.completedBy,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "ReminderCreated":
    case "ReminderTriggered":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `${event.type === "ReminderCreated" ? "Reminder created" : "Reminder triggered"}: ${event.title}`,
        description: null,
        sourceDomain: "care-management",
        sourceId: event.reminderId,
        createdBy: "createdBy" in event ? event.createdBy : null,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "ReminderMissed":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `Reminder missed: ${event.title}`,
        description: null,
        sourceDomain: "care-management",
        sourceId: event.reminderId,
        createdBy: null,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "FamilyMemberInvited":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `Family member invited: ${event.email}`,
        description: `Role: ${event.role}`,
        sourceDomain: "collaboration",
        sourceId: event.invitationId,
        createdBy: event.invitedBy,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "CommentCreated":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: "Comment added",
        description: null,
        sourceDomain: "collaboration",
        sourceId: event.commentId,
        createdBy: event.createdBy,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "NotificationSent":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `Notification sent: ${event.title}`,
        description: null,
        sourceDomain: "notifications",
        sourceId: event.notificationId,
        createdBy: null,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "DocumentUploaded":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: "Healthcare document uploaded",
        description: null,
        sourceDomain: "health-records",
        sourceId: event.documentId,
        createdBy: event.uploadedBy,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "DocumentAnalyzed":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: "Healthcare document analyzed",
        description: event.documentType ? `Document type: ${event.documentType}` : null,
        sourceDomain: "health-records",
        sourceId: event.documentId,
        createdBy: null,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "MedicalRecordCreated":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: "Medical record created",
        description: null,
        sourceDomain: "health-records",
        sourceId: event.documentId,
        createdBy: null,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "AppointmentDetected":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: "Appointment detected",
        description: event.appointmentDate ? `Date: ${event.appointmentDate}` : null,
        sourceDomain: "health-records",
        sourceId: event.documentId,
        createdBy: null,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "MedicationDetected":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: `Medication detected: ${event.medicationName}`,
        description: null,
        sourceDomain: "health-records",
        sourceId: event.documentId,
        createdBy: null,
        createdAt: event.occurredAt,
        metadata: event,
      };
    case "DocumentDeleted":
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: "Healthcare document deleted",
        description: null,
        sourceDomain: "health-records",
        sourceId: event.documentId,
        createdBy: event.deletedBy,
        createdAt: event.occurredAt,
        metadata: event,
      };
    default:
      return {
        careSpaceId: event.careSpaceId,
        eventType: event.type,
        title: event.type,
        description: null,
        sourceDomain: "system",
        sourceId: null,
        createdBy: null,
        createdAt: event.occurredAt,
        metadata: event,
      };
  }
}
