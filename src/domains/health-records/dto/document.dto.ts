import type { DocumentAnalysisResult } from "../types/analysis";
import type {
  Appointment,
  DocumentListResult,
  HealthRecordDocumentDetails,
  HealthcareDocument,
  MedicalCondition,
  MedicalInstruction,
  Medication,
} from "../types/models";

export interface UploadDocumentResponseDto {
  documentId: string;
  status: "uploaded";
}

export interface AnalyzeDocumentResponseDto {
  documentId: string;
  status: "analyzed";
  analysis: DocumentAnalysisResult;
}

export interface DocumentDto extends HealthcareDocument {}

export interface DocumentListResponseDto extends DocumentListResult {}

export interface DocumentDetailsDto {
  document: HealthcareDocument;
  analysis: {
    summary: string | null;
    confidence: number;
    structuredJson: DocumentAnalysisResult;
    createdAt: string;
  } | null;
  appointments: Appointment[];
  medications: Medication[];
  conditions: MedicalCondition[];
  instructions: MedicalInstruction[];
}

export function toUploadDocumentResponse(document: HealthcareDocument): UploadDocumentResponseDto {
  return {
    documentId: document.id,
    status: "uploaded",
  };
}

export function toDocumentDetailsDto(details: HealthRecordDocumentDetails): DocumentDetailsDto {
  return {
    document: details.document,
    analysis: details.analysis
      ? {
          summary: details.analysis.summary,
          confidence: details.analysis.confidence,
          structuredJson: details.analysis.structuredJson,
          createdAt: details.analysis.createdAt,
        }
      : null,
    appointments: details.appointments,
    medications: details.medications,
    conditions: details.conditions,
    instructions: details.instructions,
  };
}
