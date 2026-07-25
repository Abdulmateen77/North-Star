import { describe, expect, it, vi } from "vitest";

import {
  AuditEventPublisher,
  AuditLogService,
  mapDomainEventToAuditLogInput,
  redactAuditMetadata,
} from "@/shared/audit";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";
const taskId = "33333333-3333-4333-8333-333333333333";

describe("Audit logging", () => {
  it("redacts sensitive metadata before persistence", async () => {
    expect(
      redactAuditMetadata({
        token: "secret-token",
        password: "secret-password",
        nested: {
          apiKey: "secret-key",
          safe: "kept",
        },
      }),
    ).toEqual({
      token: "[REDACTED]",
      password: "[REDACTED]",
      nested: {
        apiKey: "[REDACTED]",
        safe: "kept",
      },
    });
  });

  it("persists audit records through the audit service", async () => {
    const repository = {
      create: vi.fn().mockResolvedValue({
        id: "44444444-4444-4444-8444-444444444444",
        careSpaceId,
        actorId,
        action: "TaskAssigned",
        sourceDomain: "care-management",
        sourceId: taskId,
        metadata: { title: "Confirm transport" },
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
    };
    const service = new AuditLogService(repository);

    const auditLog = await service.record({
      careSpaceId,
      actorId,
      action: "TaskAssigned",
      sourceDomain: "care-management",
      sourceId: taskId,
      metadata: { title: "Confirm transport", authorization: "Bearer secret" },
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        careSpaceId,
        actorId,
        action: "TaskAssigned",
        metadata: { title: "Confirm transport", authorization: "[REDACTED]" },
      }),
    );
    expect(auditLog.sourceDomain).toBe("care-management");
  });

  it("maps domain events into durable audit log records", async () => {
    const input = mapDomainEventToAuditLogInput({
      type: "TaskAssigned",
      careSpaceId,
      taskId,
      title: "Confirm transport",
      assignedTo: "55555555-5555-4555-8555-555555555555",
      assignedBy: actorId,
      occurredAt: "2026-01-01T00:00:00.000Z",
    });

    expect(input).toMatchObject({
      careSpaceId,
      actorId,
      action: "TaskAssigned",
      sourceDomain: "care-management",
      sourceId: taskId,
    });
    expect(input.metadata).toMatchObject({ title: "Confirm transport" });
  });

  it("publishes domain events to audit persistence", async () => {
    const service = {
      record: vi.fn().mockResolvedValue(undefined),
    };
    const publisher = new AuditEventPublisher(service);

    await publisher.publish({
      type: "DocumentUploaded",
      careSpaceId,
      documentId: "66666666-6666-4666-8666-666666666666",
      uploadedBy: actorId,
      occurredAt: "2026-01-01T00:00:00.000Z",
    });

    expect(service.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DocumentUploaded",
        actorId,
        sourceDomain: "health-records",
        sourceId: "66666666-6666-4666-8666-666666666666",
      }),
    );
  });
});
