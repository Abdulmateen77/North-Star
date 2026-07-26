import { describe, expect, it, vi } from "vitest";

import { AnalysisService } from "@/domains/health-records/services/analysis.service";
import { DocumentService } from "@/domains/health-records/services/document.service";
import { MedicalRecordService } from "@/domains/health-records/services/medical-record.service";
import type { DocumentAnalysisResult } from "@/domains/health-records/types/analysis";
import type { HealthcareDocument } from "@/domains/health-records/types/models";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const userId = "11111111-1111-4111-8111-111111111111";
const documentId = "33333333-3333-4333-8333-333333333333";

const uploadedDocument: HealthcareDocument = {
  id: documentId,
  careSpaceId,
  uploadedBy: userId,
  documentType: null,
  title: "nhs-letter.pdf",
  storageUrl: `${careSpaceId}/${documentId}/nhs-letter.pdf`,
  mimeType: "application/pdf",
  status: "uploaded",
  uploadedAt: "2026-01-01T00:00:00.000Z",
};

const analysis: DocumentAnalysisResult = {
  documentType: "appointment_letter",
  summary: "Cardiology appointment mentioning Aspirin.",
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
      instructions: null,
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
  confidence: 0.91,
};

describe("DocumentService", () => {
  it("validates, stores, and records uploaded healthcare documents", async () => {
    const documents = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(uploadedDocument),
      list: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      attachAnalysis: vi.fn(),
      softDelete: vi.fn(),
    };
    const storage = {
      upload: vi.fn().mockResolvedValue({ path: uploadedDocument.storageUrl }),
      download: vi.fn(),
      createSignedUrl: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const file = new File([new Uint8Array([1, 2, 3])], "nhs-letter.pdf", {
      type: "application/pdf",
    });

    const service = new DocumentService(documents, storage, events, {
      maxFileSizeBytes: 10_000,
    });

    const result = await service.uploadDocument({
      careSpaceId,
      uploadedBy: userId,
      file,
    });

    expect(result).toEqual(uploadedDocument);
    expect(documents.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, userId);
    expect(storage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "application/pdf",
        path: expect.stringContaining(`${careSpaceId}/`),
      }),
    );
    expect(documents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        careSpaceId,
        uploadedBy: userId,
        title: "nhs-letter.pdf",
        mimeType: "application/pdf",
      }),
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "DocumentUploaded" }),
    );
  });

  it("rejects unsupported upload MIME types", async () => {
    const service = new DocumentService({} as never, {} as never, { publish: vi.fn() }, {
      maxFileSizeBytes: 10_000,
    });
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });

    await expect(
      service.uploadDocument({ careSpaceId, uploadedBy: userId, file }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_FILE_TYPE", statusCode: 415 });
  });
});

describe("MedicalRecordService", () => {
  it("persists AI output into normalized medical record tables and publishes events", async () => {
    const analysisRepository = { create: vi.fn().mockResolvedValue(undefined) };
    const appointments = {
      createMany: vi.fn().mockResolvedValue([]),
      findByCareSpaceId: vi.fn().mockResolvedValue([]),
    };
    const medications = {
      createMany: vi.fn().mockResolvedValue([]),
      findByCareSpaceId: vi.fn().mockResolvedValue([]),
    };
    const conditions = { createMany: vi.fn().mockResolvedValue([]) };
    const instructions = { createMany: vi.fn().mockResolvedValue([]) };
    const events = { publish: vi.fn() };

    const service = new MedicalRecordService(
      analysisRepository,
      appointments,
      medications,
      conditions,
      instructions,
      events,
    );

    await service.createFromAnalysis(uploadedDocument, analysis, "source text");

    expect(analysisRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId,
        careSpaceId,
        rawText: "source text",
        structuredJson: analysis,
      }),
    );
    expect(appointments.createMany).toHaveBeenCalledWith(careSpaceId, documentId, analysis.appointments);
    expect(medications.createMany).toHaveBeenCalledWith(careSpaceId, documentId, analysis.medications);
    expect(conditions.createMany).toHaveBeenCalledWith(careSpaceId, documentId, analysis.conditions);
    expect(instructions.createMany).toHaveBeenCalledWith(careSpaceId, documentId, analysis.instructions);
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "MedicalRecordCreated" }));
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "AppointmentDetected" }));
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "MedicationDetected" }));
  });

  it("lists normalized appointments and medications for a care space", async () => {
    const appointments = {
      createMany: vi.fn().mockResolvedValue([]),
      findByCareSpaceId: vi.fn().mockResolvedValue([{ id: "appointment-1" }]),
    };
    const medications = {
      createMany: vi.fn().mockResolvedValue([]),
      findByCareSpaceId: vi.fn().mockResolvedValue([{ id: "medication-1" }]),
    };
    const service = new MedicalRecordService(
      { create: vi.fn() },
      appointments,
      medications,
      { createMany: vi.fn() },
      { createMany: vi.fn() },
      { publish: vi.fn() },
    );

    const [listedAppointments, listedMedications] = await Promise.all([
      service.listAppointments(careSpaceId),
      service.listMedications(careSpaceId),
    ]);

    expect(listedAppointments).toEqual([{ id: "appointment-1" }]);
    expect(listedMedications).toEqual([{ id: "medication-1" }]);
    expect(appointments.findByCareSpaceId).toHaveBeenCalledWith(careSpaceId);
    expect(medications.findByCareSpaceId).toHaveBeenCalledWith(careSpaceId);
  });
});

describe("AnalysisService", () => {
  it("downloads, extracts, analyzes, validates, persists, and marks the document analyzed", async () => {
    const documents = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
      list: vi.fn(),
      findById: vi.fn().mockResolvedValue(uploadedDocument),
      updateStatus: vi.fn().mockResolvedValue(undefined),
      attachAnalysis: vi.fn().mockResolvedValue({ ...uploadedDocument, status: "analyzed" }),
      softDelete: vi.fn(),
    };
    const storage = {
      upload: vi.fn(),
      download: vi.fn().mockResolvedValue(Buffer.from("pdf bytes")),
      createSignedUrl: vi.fn(),
    };
    const extractor = {
      extractText: vi.fn().mockResolvedValue(
        "Appointment date: 2026-08-14. Time: 09:30. Department: Cardiology. Clinician: Dr Smith. Medication: Aspirin 75mg daily. Hypertension. Bring your medication list to the appointment.",
      ),
    };
    const agent = { analyze: vi.fn().mockResolvedValue(analysis) };
    const medicalRecords = { createFromAnalysis: vi.fn().mockResolvedValue(undefined) };
    const events = { publish: vi.fn() };

    const service = new AnalysisService(
      documents,
      storage,
      extractor,
      agent,
      medicalRecords,
      events,
    );

    const result = await service.analyzeDocument({
      documentId,
      requestedBy: userId,
    });

    expect(documents.findById).toHaveBeenCalledWith(documentId, { includeDeleted: false });
    expect(documents.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, userId);
    expect(storage.download).toHaveBeenCalledWith(uploadedDocument.storageUrl);
    expect(agent.analyze).toHaveBeenCalledWith(expect.stringContaining("Appointment date"), { documentId });
    expect(medicalRecords.createFromAnalysis).toHaveBeenCalledWith(
      uploadedDocument,
      analysis,
      expect.stringContaining("Appointment date"),
    );
    expect(documents.attachAnalysis).toHaveBeenCalledWith(documentId, {
      documentType: "appointment_letter",
      status: "analyzed",
    });
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "DocumentAnalyzed" }));
    expect(result.analysis.summary).toBe("Cardiology appointment mentioning Aspirin.");
  });
});
