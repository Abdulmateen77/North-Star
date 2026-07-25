export interface ExtractedAppointmentInput {
  date: string | null;
  time: string | null;
  location: string | null;
  department: string | null;
  clinician: string | null;
  status: string | null;
}

export interface ExtractedMedicationInput {
  name: string;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
}

export interface ExtractedConditionInput {
  name: string;
  severity: string | null;
  notes: string | null;
}

export interface ExtractedInstructionInput {
  instruction: string;
  category: string | null;
  priority: string | null;
}

export interface DocumentAnalysisResult {
  documentType: string | null;
  summary: string | null;
  appointments: ExtractedAppointmentInput[];
  medications: ExtractedMedicationInput[];
  conditions: ExtractedConditionInput[];
  instructions: ExtractedInstructionInput[];
  confidence: number;
}

export interface AnalyzeDocumentContext {
  documentId: string;
}
