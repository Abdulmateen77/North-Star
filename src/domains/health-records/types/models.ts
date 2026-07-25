import type {
  DocumentAnalysisResult,
  ExtractedAppointmentInput,
  ExtractedConditionInput,
  ExtractedInstructionInput,
  ExtractedMedicationInput,
} from "./analysis";

export const healthcareDocumentStatuses = [
  "uploaded",
  "analyzing",
  "analyzed",
  "failed",
  "deleted",
] as const;

export type HealthcareDocumentStatus = (typeof healthcareDocumentStatuses)[number];

export const supportedHealthcareDocumentMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type SupportedHealthcareDocumentMimeType =
  (typeof supportedHealthcareDocumentMimeTypes)[number];

export interface HealthcareDocument {
  id: string;
  careSpaceId: string;
  uploadedBy: string;
  documentType: string | null;
  title: string;
  storageUrl: string;
  mimeType: string;
  status: HealthcareDocumentStatus;
  uploadedAt: string;
  deletedAt?: string | null;
}

export interface CreateHealthcareDocumentInput {
  id: string;
  careSpaceId: string;
  uploadedBy: string;
  documentType: string | null;
  title: string;
  storageUrl: string;
  mimeType: string;
  status: HealthcareDocumentStatus;
}

export interface DocumentListFilters {
  careSpaceId: string;
  status?: HealthcareDocumentStatus;
  documentType?: string;
  limit: number;
  offset: number;
  sortBy: "uploadedAt" | "title" | "documentType" | "status";
  sortDirection: "asc" | "desc";
}

export interface DocumentListResult {
  documents: HealthcareDocument[];
  total: number;
  limit: number;
  offset: number;
}

export interface ExtractedMedicalRecord {
  id: string;
  documentId: string;
  appointment: Appointment[];
  medications: Medication[];
  conditions: MedicalCondition[];
  instructions: MedicalInstruction[];
  summary: string | null;
  confidence: number;
  createdAt: string;
}

export interface Appointment extends ExtractedAppointmentInput {
  id: string;
  documentId: string;
  careSpaceId: string;
  createdAt: string;
}

export interface Medication extends ExtractedMedicationInput {
  id: string;
  documentId: string;
  careSpaceId: string;
  createdAt: string;
}

export interface MedicalCondition extends ExtractedConditionInput {
  id: string;
  documentId: string;
  careSpaceId: string;
  createdAt: string;
}

export interface MedicalInstruction extends ExtractedInstructionInput {
  id: string;
  documentId: string;
  careSpaceId: string;
  createdAt: string;
}

export interface DocumentAnalysisRecord {
  id: string;
  documentId: string;
  careSpaceId: string;
  rawText: string;
  structuredJson: DocumentAnalysisResult;
  summary: string | null;
  confidence: number;
  createdAt: string;
}

export interface HealthRecordDocumentDetails {
  document: HealthcareDocument;
  analysis: DocumentAnalysisRecord | null;
  appointments: Appointment[];
  medications: Medication[];
  conditions: MedicalCondition[];
  instructions: MedicalInstruction[];
}
