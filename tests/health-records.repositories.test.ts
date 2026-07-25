import { describe, expect, it } from "vitest";

import { mapDocumentAnalysisRow, mapDocumentRow } from "@/domains/health-records/repositories/document.repository";
import { mapAppointmentRow } from "@/domains/health-records/repositories/appointment.repository";
import { mapMedicationRow } from "@/domains/health-records/repositories/medication.repository";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const documentId = "33333333-3333-4333-8333-333333333333";

describe("Health Records repository row mapping", () => {
  it("maps document rows to canonical healthcare document models", () => {
    expect(
      mapDocumentRow({
        id: documentId,
        care_space_id: careSpaceId,
        uploaded_by: "11111111-1111-4111-8111-111111111111",
        document_type: "appointment_letter",
        title: "letter.pdf",
        storage_url: `${careSpaceId}/${documentId}/letter.pdf`,
        mime_type: "application/pdf",
        status: "analyzed",
        uploaded_at: "2026-01-01T00:00:00.000Z",
        deleted_at: null,
      }),
    ).toMatchObject({
      id: documentId,
      careSpaceId,
      documentType: "appointment_letter",
      title: "letter.pdf",
      storageUrl: `${careSpaceId}/${documentId}/letter.pdf`,
      status: "analyzed",
    });
  });

  it("maps normalized appointment and medication rows", () => {
    expect(
      mapAppointmentRow({
        id: "44444444-4444-4444-8444-444444444444",
        care_space_id: careSpaceId,
        document_id: documentId,
        date: "2026-08-14",
        time: "09:30",
        location: null,
        department: "Cardiology",
        clinician: "Dr Smith",
        status: null,
        created_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      documentId,
      date: "2026-08-14",
      department: "Cardiology",
    });

    expect(
      mapMedicationRow({
        id: "55555555-5555-4555-8555-555555555555",
        care_space_id: careSpaceId,
        document_id: documentId,
        name: "Aspirin",
        dosage: "75mg",
        frequency: "daily",
        instructions: null,
        created_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      documentId,
      name: "Aspirin",
      dosage: "75mg",
    });
  });

  it("maps persisted document analysis rows with structured JSON", () => {
    expect(
      mapDocumentAnalysisRow({
        id: "66666666-6666-4666-8666-666666666666",
        care_space_id: careSpaceId,
        document_id: documentId,
        extracted_text: "Appointment text",
        structured_json: { documentType: "appointment_letter", confidence: 0.9 },
        summary: "Appointment summary",
        confidence: 0.9,
        created_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      documentId,
      rawText: "Appointment text",
      summary: "Appointment summary",
      confidence: 0.9,
    });
  });
});
