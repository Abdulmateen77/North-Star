import { z } from "zod";

const nullableTrimmedString = z
  .string()
  .trim()
  .min(1)
  .nullable();

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const extractedAppointmentSchema = z
  .object({
    date: nullableTrimmedString.refine((value) => value === null || isIsoDate(value), {
      message: "Appointment date must be normalized as YYYY-MM-DD.",
    }),
    time: nullableTrimmedString.refine(
      (value) => value === null || /^\d{2}:\d{2}$/.test(value),
      { message: "Appointment time must be normalized as HH:MM." },
    ),
    location: nullableTrimmedString,
    department: nullableTrimmedString,
    clinician: nullableTrimmedString,
    status: nullableTrimmedString,
  })
  .strict();

export const extractedMedicationSchema = z
  .object({
    name: z.string().trim().min(1),
    dosage: nullableTrimmedString,
    frequency: nullableTrimmedString,
    instructions: nullableTrimmedString,
  })
  .strict();

export const extractedConditionSchema = z
  .object({
    name: z.string().trim().min(1),
    severity: nullableTrimmedString,
    notes: nullableTrimmedString,
  })
  .strict();

export const extractedInstructionSchema = z
  .object({
    instruction: z.string().trim().min(1),
    category: nullableTrimmedString,
    priority: nullableTrimmedString,
  })
  .strict();

export const documentAnalysisSchema = z
  .object({
    documentType: nullableTrimmedString,
    summary: nullableTrimmedString,
    appointments: z.array(extractedAppointmentSchema).default([]),
    medications: z.array(extractedMedicationSchema).default([]),
    conditions: z.array(extractedConditionSchema).default([]),
    instructions: z.array(extractedInstructionSchema).default([]),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export const analysisOutputSchema = documentAnalysisSchema.refine(
  (input) =>
    Boolean(input.summary) ||
    input.appointments.length > 0 ||
    input.medications.length > 0 ||
    input.conditions.length > 0 ||
    input.instructions.length > 0,
  { message: "AI output cannot be empty." },
);
