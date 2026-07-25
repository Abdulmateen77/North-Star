import type { DocumentListFilters, HealthRecordDocumentDetails } from "../types/models";
import type { UploadDocumentResponseDto } from "../dto/document.dto";
import { toUploadDocumentResponse } from "../dto/document.dto";
import type { AnalyzeDocumentInput, AnalyzeDocumentResult } from "./analysis.service";
import type { AnalysisService } from "./analysis.service";
import type { DocumentService, UploadDocumentInput } from "./document.service";
import type { MedicalRecordService } from "./medical-record.service";

export class HealthRecordService {
  constructor(
    private readonly documents: DocumentService,
    private readonly analysis: AnalysisService,
    private readonly medicalRecords: MedicalRecordService,
  ) {}

  async uploadDocument(input: UploadDocumentInput): Promise<UploadDocumentResponseDto> {
    const document = await this.documents.uploadDocument(input);
    return toUploadDocumentResponse(document);
  }

  async analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentResult> {
    return this.analysis.analyzeDocument(input);
  }

  async listDocuments(requestedBy: string, filters: DocumentListFilters) {
    return this.documents.listDocuments(requestedBy, filters);
  }

  async getDocument(documentId: string, requestedBy: string): Promise<HealthRecordDocumentDetails> {
    const [signedDocument, storedDocument] = await Promise.all([
      this.documents.getDocument(documentId, requestedBy),
      this.documents.getStoredDocument(documentId, requestedBy),
    ]);
    const medicalRecord = await this.medicalRecords.getByDocument(storedDocument);

    return {
      document: signedDocument,
      ...medicalRecord,
    };
  }

  async deleteDocument(documentId: string, requestedBy: string): Promise<void> {
    await this.documents.deleteDocument(documentId, requestedBy);
  }
}
