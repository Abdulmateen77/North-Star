export type DomainEvent =
  | {
      type: "TaskCreated";
      careSpaceId: string;
      taskId: string;
      title: string;
      createdBy: string;
      occurredAt: string;
    }
  | {
      type: "TaskAssigned";
      careSpaceId: string;
      taskId: string;
      title: string;
      assignedTo: string;
      assignedBy: string;
      occurredAt: string;
    }
  | {
      type: "TaskCompleted";
      careSpaceId: string;
      taskId: string;
      title: string;
      completedBy: string;
      occurredAt: string;
    }
  | {
      type: "ReminderCreated";
      careSpaceId: string;
      reminderId: string;
      title: string;
      createdBy: string;
      occurredAt: string;
    }
  | {
      type: "ReminderTriggered";
      careSpaceId: string;
      reminderId: string;
      title: string;
      triggeredAt: string;
      occurredAt: string;
    }
  | {
      type: "AppointmentCreated";
      careSpaceId: string;
      appointmentId: string;
      title: string;
      createdBy: string;
      occurredAt: string;
    }
  | {
      type: "AppointmentCompleted";
      careSpaceId: string;
      appointmentId: string;
      title: string;
      completedBy: string;
      occurredAt: string;
    }
  | {
      type: "FamilyMemberInvited";
      careSpaceId: string;
      invitationId: string;
      email: string;
      role: string;
      invitedBy: string;
      occurredAt: string;
    }
  | {
      type: "InvitationAccepted";
      careSpaceId: string;
      invitationId: string;
      acceptedBy: string;
      occurredAt: string;
    }
  | {
      type: "CommentCreated";
      careSpaceId: string;
      commentId: string;
      targetType: string;
      targetId: string | null;
      createdBy: string;
      occurredAt: string;
    }
  | {
      type: "NotificationSent";
      careSpaceId: string;
      notificationId: string;
      recipientId: string;
      channel: string;
      title: string;
      occurredAt: string;
    }
  | {
      type: "TimelineEventCreated";
      careSpaceId: string;
      timelineEventId: string;
      eventType: string;
      occurredAt: string;
    }
  | {
      type: "MedicalRecordCreated";
      careSpaceId: string;
      documentId: string;
      analysis?: unknown;
      occurredAt: string;
    }
  | {
      type: "DocumentUploaded";
      careSpaceId: string;
      documentId: string;
      uploadedBy: string;
      occurredAt: string;
    }
  | {
      type: "DocumentAnalyzed";
      careSpaceId: string;
      documentId: string;
      documentType: string | null;
      confidence: number;
      occurredAt: string;
    }
  | {
      type: "AppointmentDetected";
      careSpaceId: string;
      documentId: string;
      appointmentDate: string | null;
      occurredAt: string;
    }
  | {
      type: "MedicationDetected";
      careSpaceId: string;
      documentId: string;
      medicationName: string;
      occurredAt: string;
    }
  | {
      type: "DocumentDeleted";
      careSpaceId: string;
      documentId: string;
      deletedBy: string;
      occurredAt: string;
    };

export interface DomainEventPublisher {
  publish(event: DomainEvent): Promise<void> | void;
}

export type DomainEventType = DomainEvent["type"];

export function getEventCareSpaceId(event: DomainEvent): string {
  return event.careSpaceId;
}
