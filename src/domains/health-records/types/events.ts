import type { DomainEvent, DomainEventPublisher } from "@/shared/events/domain-events";
import { InMemoryEventPublisher, LoggingEventPublisher } from "@/shared/events/event-publisher";

import type { HealthcareDocument } from "./models";

export type HealthRecordDomainEvent = Extract<
  DomainEvent,
  | { type: "DocumentUploaded" }
  | { type: "DocumentAnalyzed" }
  | { type: "MedicalRecordCreated" }
  | { type: "AppointmentDetected" }
  | { type: "MedicationDetected" }
  | { type: "DocumentDeleted" }
>;

export type { DomainEventPublisher };

export class InMemoryDomainEventPublisher extends InMemoryEventPublisher {}

export class LoggingDomainEventPublisher extends LoggingEventPublisher {}

export function documentUploadedEvent(document: HealthcareDocument): HealthRecordDomainEvent {
  return {
    type: "DocumentUploaded",
    careSpaceId: document.careSpaceId,
    documentId: document.id,
    uploadedBy: document.uploadedBy,
    occurredAt: new Date().toISOString(),
  };
}
