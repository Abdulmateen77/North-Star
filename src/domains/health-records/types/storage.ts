import type { HealthcareDocument } from "./models";

export interface UploadHealthcareDocumentInput {
  path: string;
  body: Buffer;
  contentType: string;
}

export interface UploadHealthcareDocumentResult {
  path: string;
}

export interface HealthcareDocumentStorage {
  upload(input: UploadHealthcareDocumentInput): Promise<UploadHealthcareDocumentResult>;
  download(path: string): Promise<Buffer>;
  createSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
}

export interface ExtractTextInput {
  document: HealthcareDocument;
  file: Buffer;
}

export interface DocumentTextExtractor {
  extractText(input: ExtractTextInput): Promise<string>;
}
