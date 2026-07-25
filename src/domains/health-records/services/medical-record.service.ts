import { AppError } from "@/lib/errors";

import type { DocumentAnalysisResult } from "../types/analysis";
import type { DomainEventPublisher } from "../types/events";
import type { HealthRecordDocumentDetails, HealthcareDocument } from "../types/models";
import type {
  AppointmentRepository,
  ConditionRepository,
  DocumentAnalysisRepository,
  InstructionRepository,
  MedicationRepository,
} from "../types/repositories";
import { databaseTransactionFailure } from "../types/errors";

export class MedicalRecordService {
  constructor(
    private readonly analysisRepository: DocumentAnalysisRepository,
    private readonly appointments: AppointmentRepository,
    private readonly medications: MedicationRepository,
    private readonly conditions: ConditionRepository,
    private readonly instructions: InstructionRepository,
    private readonly events: DomainEventPublisher,
  ) {}

  async createFromAnalysis(
    document: HealthcareDocument,
    analysis: DocumentAnalysisResult,
    rawText: string,
  ): Promise<void> {
    try {
      await this.analysisRepository.create({
        careSpaceId: document.careSpaceId,
        documentId: document.id,
        rawText,
        structuredJson: analysis,
        summary: analysis.summary,
        confidence: analysis.confidence,
      });

      await this.appointments.createMany(document.careSpaceId, document.id, analysis.appointments);
      await this.medications.createMany(document.careSpaceId, document.id, analysis.medications);
      await this.conditions.createMany(document.careSpaceId, document.id, analysis.conditions);
      await this.instructions.createMany(document.careSpaceId, document.id, analysis.instructions);
    } catch (error) {
      if (error instanceof AppError && error.code === "DATABASE_TRANSACTION_FAILURE") {
        throw error;
      }

      throw databaseTransactionFailure({
        message: error instanceof Error ? error.message : String(error),
      });
    }

    await this.events.publish({
      type: "MedicalRecordCreated",
      careSpaceId: document.careSpaceId,
      documentId: document.id,
      analysis,
      occurredAt: new Date().toISOString(),
    });

    for (const appointment of analysis.appointments) {
      await this.events.publish({
        type: "AppointmentDetected",
        careSpaceId: document.careSpaceId,
        documentId: document.id,
        appointmentDate: appointment.date,
        occurredAt: new Date().toISOString(),
      });
    }

    for (const medication of analysis.medications) {
      await this.events.publish({
        type: "MedicationDetected",
        careSpaceId: document.careSpaceId,
        documentId: document.id,
        medicationName: medication.name,
        occurredAt: new Date().toISOString(),
      });
    }
  }

  async getByDocument(document: HealthcareDocument): Promise<Omit<HealthRecordDocumentDetails, "document">> {
    const [analysis, appointments, medications, conditions, instructions] = await Promise.all([
      this.analysisRepository.findLatestByDocument?.(document.id) ?? Promise.resolve(null),
      this.appointments.findByDocumentId?.(document.id) ?? Promise.resolve([]),
      this.medications.findByDocumentId?.(document.id) ?? Promise.resolve([]),
      this.conditions.findByDocumentId?.(document.id) ?? Promise.resolve([]),
      this.instructions.findByDocumentId?.(document.id) ?? Promise.resolve([]),
    ]);

    return {
      analysis,
      appointments,
      medications,
      conditions,
      instructions,
    };
  }
}
