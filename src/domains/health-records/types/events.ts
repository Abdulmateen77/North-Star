import type { DocumentAnalysisResult } from "./analysis";
import type { HealthcareDocument } from "./models";

export type HealthRecordDomainEvent =
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
      type: "MedicalRecordCreated";
      careSpaceId: string;
      documentId: string;
      analysis: DocumentAnalysisResult;
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
  publish(event: HealthRecordDomainEvent): Promise<void> | void;
}

export class InMemoryDomainEventPublisher implements DomainEventPublisher {
  readonly events: HealthRecordDomainEvent[] = [];

  publish(event: HealthRecordDomainEvent): void {
    this.events.push(event);
  }
}

export class LoggingDomainEventPublisher implements DomainEventPublisher {
  async publish(event: HealthRecordDomainEvent): Promise<void> {
    console.log(JSON.stringify({ domain: "health-records", event }));
  }
}

export function documentUploadedEvent(document: HealthcareDocument): HealthRecordDomainEvent {
  return {
    type: "DocumentUploaded",
    careSpaceId: document.careSpaceId,
    documentId: document.id,
    uploadedBy: document.uploadedBy,
    occurredAt: new Date().toISOString(),
  };
}
