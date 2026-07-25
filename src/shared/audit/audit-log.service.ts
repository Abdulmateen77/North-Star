import type { AuditLog, AuditLogRepository, CreateAuditLogInput } from "./models";
import { redactAuditMetadataRecord } from "./redaction";

export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async record(input: CreateAuditLogInput): Promise<AuditLog> {
    return this.repository.create({
      ...input,
      actorId: input.actorId ?? null,
      sourceId: input.sourceId ?? null,
      metadata: redactAuditMetadataRecord(input.metadata ?? {}),
      createdAt: input.createdAt ?? new Date().toISOString(),
    });
  }
}
