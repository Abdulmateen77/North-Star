import type { z } from "zod";

import type { DocumentAnalysisResult } from "../types/analysis";
import { malformedAiResponse } from "../types/errors";
import { analysisOutputSchema } from "../schemas/document-analysis.schema";

export type ValidatedDocumentAnalysisResult = z.output<typeof analysisOutputSchema>;

const MIN_ANCHOR_LENGTH = 3;

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyAnchored(value: string, sourceText: string): boolean {
  const normalizedValue = normalizeForSearch(value);
  if (normalizedValue.length < MIN_ANCHOR_LENGTH) {
    return true;
  }

  const normalizedSource = normalizeForSearch(sourceText);
  if (normalizedSource.includes(normalizedValue)) {
    return true;
  }

  const tokens = normalizedValue.split(" ").filter((token) => token.length >= MIN_ANCHOR_LENGTH);
  if (tokens.length === 0) {
    return true;
  }

  return tokens.every((token) => normalizedSource.includes(token));
}

function collectAnchoredFields(result: ValidatedDocumentAnalysisResult): string[] {
  const values: string[] = [];

  for (const appointment of result.appointments) {
    for (const value of [
      appointment.location,
      appointment.department,
      appointment.clinician,
      appointment.status,
    ]) {
      if (value) {
        values.push(value);
      }
    }
  }

  for (const medication of result.medications) {
    values.push(medication.name);
  }

  for (const condition of result.conditions) {
    values.push(condition.name);
  }

  for (const instruction of result.instructions) {
    values.push(instruction.instruction);
  }

  return values;
}

export function validateDocumentAnalysisResult(
  input: unknown,
  sourceText: string,
): DocumentAnalysisResult {
  const result = analysisOutputSchema.safeParse(input);

  if (!result.success) {
    throw malformedAiResponse({
      message: result.error.issues.map((issue) => issue.message).join("; "),
      issues: result.error.flatten(),
    });
  }

  const hallucinatedValues = collectAnchoredFields(result.data).filter(
    (value) => !isLikelyAnchored(value, sourceText),
  );

  if (hallucinatedValues.length > 0) {
    throw malformedAiResponse({
      message: "AI output includes values not present in the source text.",
      values: hallucinatedValues,
    });
  }

  return result.data as DocumentAnalysisResult;
}
