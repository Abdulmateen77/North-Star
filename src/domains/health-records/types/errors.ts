import { AppError } from "@/lib/errors";

export function healthRecordError(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): AppError {
  return new AppError({ statusCode, code, message, details });
}

export function unsupportedFileType(mimeType: string): AppError {
  return healthRecordError(
    415,
    "UNSUPPORTED_FILE_TYPE",
    "Unsupported healthcare document file type.",
    { mimeType },
  );
}

export function fileTooLarge(size: number, maxSize: number): AppError {
  return healthRecordError(413, "FILE_TOO_LARGE", "Healthcare document exceeds the size limit.", {
    size,
    maxSize,
  });
}

export function storageFailure(message = "Healthcare document storage failed.", details?: unknown): AppError {
  return healthRecordError(502, "STORAGE_FAILURE", message, details);
}

export function ocrFailure(message = "Healthcare document text extraction failed.", details?: unknown): AppError {
  return healthRecordError(422, "OCR_FAILURE", message, details);
}

export function aiTimeout(details?: unknown): AppError {
  return healthRecordError(504, "AI_TIMEOUT", "AI document analysis timed out.", details);
}

export function aiAnalysisFailure(message = "AI document analysis failed.", details?: unknown): AppError {
  return healthRecordError(502, "AI_ANALYSIS_FAILED", message, details);
}

export function malformedAiResponse(details?: unknown): AppError {
  const detailMessage =
    details &&
    typeof details === "object" &&
    "message" in details &&
    typeof details.message === "string"
      ? ` ${details.message}`
      : "";

  return healthRecordError(
    502,
    "MALFORMED_AI_RESPONSE",
    `Malformed AI response.${detailMessage}`,
    details,
  );
}

export function databaseTransactionFailure(details?: unknown): AppError {
  return healthRecordError(
    500,
    "DATABASE_TRANSACTION_FAILURE",
    "Failed to persist normalized medical records.",
    details,
  );
}
