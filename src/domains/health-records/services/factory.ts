import { createOpenAIClient } from "@/lib/openai/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/env";

import { DocumentAgent, type OpenAIChatCompletionClient } from "../agents/document.agent";
import { HealthRecordController } from "../controllers/health-record.controller";
import { SupabaseAppointmentRepository } from "../repositories/appointment.repository";
import { SupabaseConditionRepository } from "../repositories/condition.repository";
import {
  SupabaseDocumentAnalysisRepository,
  SupabaseDocumentRepository,
} from "../repositories/document.repository";
import { SupabaseInstructionRepository } from "../repositories/instruction.repository";
import { SupabaseMedicationRepository } from "../repositories/medication.repository";
import { LoggingDomainEventPublisher } from "../types/events";
import { AnalysisService } from "./analysis.service";
import { DocumentService } from "./document.service";
import { HealthRecordService } from "./health-record.service";
import { MedicalRecordService } from "./medical-record.service";
import { SupabaseHealthcareDocumentStorage } from "./storage.service";
import { TextExtractionService } from "./text-extraction.service";

function createLazyOpenAIChatClient(): OpenAIChatCompletionClient {
  return {
    chat: {
      completions: {
        create: (input) =>
          createOpenAIClient().chat.completions.create(input as never) as never,
      },
    },
  };
}

export function createHealthRecordService(): HealthRecordService {
  const env = getEnv();
  const supabase = createSupabaseServerClient();
  const events = new LoggingDomainEventPublisher();

  const documentRepository = new SupabaseDocumentRepository(supabase);
  const analysisRepository = new SupabaseDocumentAnalysisRepository(supabase);
  const appointmentRepository = new SupabaseAppointmentRepository(supabase);
  const medicationRepository = new SupabaseMedicationRepository(supabase);
  const conditionRepository = new SupabaseConditionRepository(supabase);
  const instructionRepository = new SupabaseInstructionRepository(supabase);

  const storage = new SupabaseHealthcareDocumentStorage(
    supabase,
    env.HEALTH_RECORDS_STORAGE_BUCKET,
  );
  const openAIClient = createLazyOpenAIChatClient();
  const extractor = new TextExtractionService({
    imageOcrModel: env.OPENAI_OCR_MODEL,
    openAIClient,
  });
  const documentAgent = new DocumentAgent(openAIClient, {
    model: env.OPENAI_HEALTH_RECORDS_MODEL,
    timeoutMs: env.HEALTH_RECORDS_AI_TIMEOUT_MS,
  });

  const medicalRecords = new MedicalRecordService(
    analysisRepository,
    appointmentRepository,
    medicationRepository,
    conditionRepository,
    instructionRepository,
    events,
  );
  const documents = new DocumentService(documentRepository, storage, events, {
    maxFileSizeBytes: env.HEALTH_RECORDS_MAX_FILE_SIZE_BYTES,
  });
  const analysis = new AnalysisService(
    documentRepository,
    storage,
    extractor,
    documentAgent,
    medicalRecords,
    events,
  );

  return new HealthRecordService(documents, analysis, medicalRecords);
}

export function createHealthRecordController(): HealthRecordController {
  return new HealthRecordController(createHealthRecordService());
}
