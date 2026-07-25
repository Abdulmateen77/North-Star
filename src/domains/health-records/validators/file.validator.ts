import {
  supportedHealthcareDocumentMimeTypes,
  type SupportedHealthcareDocumentMimeType,
} from "../types/models";
import { fileTooLarge, unsupportedFileType } from "../types/errors";

const supportedMimeTypes = new Set<string>(supportedHealthcareDocumentMimeTypes);

export function assertSupportedHealthcareDocument(
  file: File,
  maxFileSizeBytes: number,
): asserts file is File & { type: SupportedHealthcareDocumentMimeType } {
  if (!supportedMimeTypes.has(file.type)) {
    throw unsupportedFileType(file.type || "unknown");
  }

  if (file.size > maxFileSizeBytes) {
    throw fileTooLarge(file.size, maxFileSizeBytes);
  }
}

export function sanitizeStorageFilename(filename: string): string {
  const normalized = filename
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .replace(/\s+/g, "-");

  return normalized || "document";
}
