import { notFound } from "@/lib/errors";
import { logger, type Logger } from "@/lib/logger";

import type { DocumentAnalysisResult } from "../types/analysis";
import type { AnalyzeDocumentContext } from "../types/analysis";
import type { DomainEventPublisher } from "../types/events";
import type { HealthcareDocument } from "../types/models";
import type { DocumentRepository } from "../types/repositories";
import type { DocumentTextExtractor, HealthcareDocumentStorage } from "../types/storage";
import { validateDocumentAnalysisResult } from "../validators/analysis.validator";

export interface AnalyzeDocumentInput {
  documentId: string;
  requestedBy: string;
}

export interface AnalyzeDocumentResult {
  documentId: string;
  status: "analyzed";
  analysis: DocumentAnalysisResult;
}

export interface DocumentAnalyzer {
  analyze(text: string, context: AnalyzeDocumentContext): Promise<DocumentAnalysisResult>;
}

export interface MedicalRecordWriter {
  createFromAnalysis(
    document: HealthcareDocument,
    analysis: DocumentAnalysisResult,
    rawText: string,
  ): Promise<void>;
}

export class AnalysisService {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly storage: HealthcareDocumentStorage,
    private readonly extractor: DocumentTextExtractor,
    private readonly agent: DocumentAnalyzer,
    private readonly medicalRecords: MedicalRecordWriter,
    private readonly events: DomainEventPublisher,
    private readonly routeLogger: Logger = logger,
  ) {}

  async analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentResult> {
    const totalStartedAt = Date.now();
    const document = await this.documents.findById(input.documentId, {
      includeDeleted: false,
    });

    if (!document) {
      throw notFound("Healthcare document not found.");
    }

    await this.documents.assertCareSpaceMember(document.careSpaceId, input.requestedBy);
    await this.documents.updateStatus(document.id, "analyzing");

    try {
      const downloadStartedAt = Date.now();
      const file = await this.storage.download(document.storageUrl);
      const downloadDurationMs = Date.now() - downloadStartedAt;

      const ocrStartedAt = Date.now();
      const extractedText = await this.extractor.extractText({ document, file });
      const ocrDurationMs = Date.now() - ocrStartedAt;

      const aiStartedAt = Date.now();
      const aiResult = await this.agent.analyze(extractedText, { documentId: document.id });
      const analysis = validateDocumentAnalysisResult(aiResult, extractedText);
      const aiDurationMs = Date.now() - aiStartedAt;

      const persistenceStartedAt = Date.now();
      await this.medicalRecords.createFromAnalysis(document, analysis, extractedText);
      await this.documents.attachAnalysis(document.id, {
        documentType: analysis.documentType,
        status: "analyzed",
      });
      const persistenceDurationMs = Date.now() - persistenceStartedAt;

      await this.events.publish({
        type: "DocumentAnalyzed",
        careSpaceId: document.careSpaceId,
        documentId: document.id,
        documentType: analysis.documentType,
        confidence: analysis.confidence,
        occurredAt: new Date().toISOString(),
      });

      this.routeLogger.info("health_records.document.analyzed", {
        careSpaceId: document.careSpaceId,
        documentId: document.id,
        downloadDurationMs,
        ocrDurationMs,
        aiDurationMs,
        persistenceDurationMs,
        totalProcessingTimeMs: Date.now() - totalStartedAt,
      });

      return {
        documentId: document.id,
        status: "analyzed",
        analysis,
      };
    } catch (error) {
      await this.documents.updateStatus(document.id, "failed").catch(() => undefined);
      throw error;
    }
  }
}
