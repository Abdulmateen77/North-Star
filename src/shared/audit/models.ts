export interface AuditLog {
  id: string;
  careSpaceId: string;
  actorId: string | null;
  action: string;
  sourceDomain: string;
  sourceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CreateAuditLogInput {
  careSpaceId: string;
  actorId?: string | null;
  action: string;
  sourceDomain: string;
  sourceId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface AuditLogRepository {
  create(input: CreateAuditLogInput): Promise<AuditLog>;
}
