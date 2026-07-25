import type {
  DocumentAnalysisResult,
  ExtractedAppointmentInput,
  ExtractedConditionInput,
  ExtractedInstructionInput,
  ExtractedMedicationInput,
} from "./analysis";
import type {
  Appointment,
  CreateHealthcareDocumentInput,
  DocumentAnalysisRecord,
  DocumentListFilters,
  DocumentListResult,
  HealthcareDocument,
  HealthcareDocumentStatus,
  MedicalCondition,
  MedicalInstruction,
  Medication,
} from "./models";

export interface DocumentRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  create(input: CreateHealthcareDocumentInput): Promise<HealthcareDocument>;
  list(filters: DocumentListFilters): Promise<DocumentListResult>;
  findById(
    id: string,
    options?: { includeDeleted?: boolean },
  ): Promise<HealthcareDocument | null>;
  updateStatus(id: string, status: HealthcareDocumentStatus): Promise<void>;
  attachAnalysis(
    id: string,
    input: { documentType: string | null; status: HealthcareDocumentStatus },
  ): Promise<HealthcareDocument>;
  softDelete(id: string): Promise<void>;
}

export interface DocumentAnalysisRepository {
  create(input: {
    careSpaceId: string;
    documentId: string;
    rawText: string;
    structuredJson: DocumentAnalysisResult;
    summary: string | null;
    confidence: number;
  }): Promise<DocumentAnalysisRecord> | Promise<void>;
  findLatestByDocument?(documentId: string): Promise<DocumentAnalysisRecord | null>;
}

export interface AppointmentRepository {
  createMany(
    careSpaceId: string,
    documentId: string,
    appointments: ExtractedAppointmentInput[],
  ): Promise<Appointment[]> | Promise<void>;
  findByDocumentId?(documentId: string): Promise<Appointment[]>;
}

export interface MedicationRepository {
  createMany(
    careSpaceId: string,
    documentId: string,
    medications: ExtractedMedicationInput[],
  ): Promise<Medication[]> | Promise<void>;
  findByDocumentId?(documentId: string): Promise<Medication[]>;
}

export interface ConditionRepository {
  createMany(
    careSpaceId: string,
    documentId: string,
    conditions: ExtractedConditionInput[],
  ): Promise<MedicalCondition[]> | Promise<void>;
  findByDocumentId?(documentId: string): Promise<MedicalCondition[]>;
}

export interface InstructionRepository {
  createMany(
    careSpaceId: string,
    documentId: string,
    instructions: ExtractedInstructionInput[],
  ): Promise<MedicalInstruction[]> | Promise<void>;
  findByDocumentId?(documentId: string): Promise<MedicalInstruction[]>;
}
