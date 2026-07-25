import { describe, expect, it } from "vitest";

import { validateDocumentAnalysisResult } from "@/domains/health-records/validators/analysis.validator";

const sourceText = `
NHS outpatient appointment letter.
Appointment date: 2026-08-14.
Time: 09:30.
Department: Cardiology.
Clinician: Dr Smith.
Medication: Aspirin 75mg daily with food.
Condition: Hypertension.
Instruction: Bring your medication list to the appointment.
`;

describe("Health Records AI output validation", () => {
  it("accepts structured healthcare data anchored in extracted source text", () => {
    const result = validateDocumentAnalysisResult(
      {
        documentType: "appointment_letter",
        summary: "Cardiology appointment letter for hypertension follow-up.",
        appointments: [
          {
            date: "2026-08-14",
            time: "09:30",
            location: null,
            department: "Cardiology",
            clinician: "Dr Smith",
            status: null,
          },
        ],
        medications: [
          {
            name: "Aspirin",
            dosage: "75mg",
            frequency: "daily",
            instructions: "with food",
          },
        ],
        conditions: [
          {
            name: "Hypertension",
            severity: null,
            notes: null,
          },
        ],
        instructions: [
          {
            instruction: "Bring your medication list to the appointment.",
            category: "appointment_preparation",
            priority: "medium",
          },
        ],
        confidence: 0.94,
      },
      sourceText,
    );

    expect(result.documentType).toBe("appointment_letter");
    expect(result.appointments[0]?.date).toBe("2026-08-14");
    expect(result.medications[0]?.name).toBe("Aspirin");
    expect(result.confidence).toBe(0.94);
  });

  it("rejects malformed dates returned by the AI", () => {
    expect(() =>
      validateDocumentAnalysisResult(
        {
          documentType: "appointment_letter",
          summary: "Cardiology appointment letter.",
          appointments: [
            {
              date: "14/08/2026",
              time: "09:30",
              location: null,
              department: "Cardiology",
              clinician: "Dr Smith",
              status: null,
            },
          ],
          medications: [],
          conditions: [],
          instructions: [],
          confidence: 0.9,
        },
        sourceText,
      ),
    ).toThrow(/Malformed AI response/);
  });

  it("rejects empty AI output objects", () => {
    expect(() =>
      validateDocumentAnalysisResult(
        {
          documentType: null,
          summary: null,
          appointments: [],
          medications: [],
          conditions: [],
          instructions: [],
          confidence: 0.5,
        },
        sourceText,
      ),
    ).toThrow(/empty/i);
  });

  it("rejects likely hallucinated values that are not present in the source text", () => {
    expect(() =>
      validateDocumentAnalysisResult(
        {
          documentType: "medication_list",
          summary: "Medication list.",
          appointments: [],
          medications: [
            {
              name: "Warfarin",
              dosage: "5mg",
              frequency: "daily",
              instructions: null,
            },
          ],
          conditions: [],
          instructions: [],
          confidence: 0.8,
        },
        sourceText,
      ),
    ).toThrow(/not present in the source/i);
  });
});
