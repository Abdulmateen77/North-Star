import { randomUUID } from "node:crypto";

import { notFound } from "@/lib/errors";
import { logger, type Logger } from "@/lib/logger";

import type { DomainEventPublisher } from "../types/events";
import type {
  DocumentListFilters,
  DocumentListResult,
  HealthcareDocument,
} from "../types/models";
import type { DocumentRepository } from "../types/repositories";
import type { HealthcareDocumentStorage } from "../types/storage";
import { documentUploadedEvent } from "../types/events";
import { storageFailure } from "../types/errors";
import {
  assertSupportedHealthcareDocument,
  sanitizeStorageFilename,
} from "../validators/file.validator";

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SIGNED_URL_EXPIRY_SECONDS = 60 * 10;

export interface DocumentServiceOptions {
  maxFileSizeBytes?: number;
}

export interface UploadDocumentInput {
  careSpaceId: string;
  uploadedBy: string;
  file: File;
}

export class DocumentService {
  private readonly maxFileSizeBytes: number;

  constructor(
    private readonly documents: DocumentRepository,
    private readonly storage: HealthcareDocumentStorage,
    private readonly events: DomainEventPublisher,
    options: DocumentServiceOptions = {},
    private readonly routeLogger: Logger = logger,
  ) {
    this.maxFileSizeBytes = options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  }

  async uploadDocument(input: UploadDocumentInput): Promise<HealthcareDocument> {
    const startedAt = Date.now();
    assertSupportedHealthcareDocument(input.file, this.maxFileSizeBytes);

    await this.documents.assertCareSpaceMember(input.careSpaceId, input.uploadedBy);

    const documentId = randomUUID();
    const filename = sanitizeStorageFilename(input.file.name);
    const path = `${input.careSpaceId}/${documentId}/${filename}`;
    const body = Buffer.from(await input.file.arrayBuffer());

    let storedPath: string;
    const storageStartedAt = Date.now();

    try {
      const upload = await this.storage.upload({
        path,
        body,
        contentType: input.file.type,
      });
      storedPath = upload.path;
    } catch (error) {
      throw storageFailure("Healthcare document upload failed.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }

    const document = await this.documents.create({
      id: documentId,
      careSpaceId: input.careSpaceId,
      uploadedBy: input.uploadedBy,
      documentType: null,
      title: input.file.name,
      storageUrl: storedPath,
      mimeType: input.file.type,
      status: "uploaded",
    });

    await this.events.publish(documentUploadedEvent(document));

    this.routeLogger.info("health_records.document.uploaded", {
      careSpaceId: input.careSpaceId,
      documentId,
      mimeType: input.file.type,
      fileSizeBytes: input.file.size,
      uploadDurationMs: Date.now() - storageStartedAt,
      totalDurationMs: Date.now() - startedAt,
    });

    return document;
  }

  async listDocuments(
    requestedBy: string,
    filters: DocumentListFilters,
  ): Promise<DocumentListResult> {
    await this.documents.assertCareSpaceMember(filters.careSpaceId, requestedBy);
    return this.documents.list(filters);
  }

  async getDocument(documentId: string, requestedBy: string): Promise<HealthcareDocument> {
    const document = await this.documents.findById(documentId, { includeDeleted: false });

    if (!document) {
      throw notFound("Healthcare document not found.");
    }

    await this.documents.assertCareSpaceMember(document.careSpaceId, requestedBy);

    try {
      const signedUrl = await this.storage.createSignedUrl(
        document.storageUrl,
        SIGNED_URL_EXPIRY_SECONDS,
      );

      return { ...document, storageUrl: signedUrl };
    } catch (error) {
      throw storageFailure("Failed to create signed document URL.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getStoredDocument(documentId: string, requestedBy: string): Promise<HealthcareDocument> {
    const document = await this.documents.findById(documentId, { includeDeleted: false });

    if (!document) {
      throw notFound("Healthcare document not found.");
    }

    await this.documents.assertCareSpaceMember(document.careSpaceId, requestedBy);
    return document;
  }

  async deleteDocument(documentId: string, requestedBy: string): Promise<void> {
    const document = await this.getStoredDocument(documentId, requestedBy);
    await this.documents.softDelete(document.id);
    await this.events.publish({
      type: "DocumentDeleted",
      careSpaceId: document.careSpaceId,
      documentId: document.id,
      deletedBy: requestedBy,
      occurredAt: new Date().toISOString(),
    });
  }
}
