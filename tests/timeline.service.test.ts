import { describe, expect, it, vi } from "vitest";

import { TimelineService } from "@/domains/timeline/services/timeline.service";
import type { TimelineRepository } from "@/domains/timeline/types/repositories";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";

describe("TimelineService", () => {
  it("projects strongly typed domain events into append-only timeline entries", async () => {
    const repository: TimelineRepository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "55555555-5555-4555-8555-555555555555",
        ...input,
        createdAt: "2026-01-01T00:00:00.000Z",
      })),
      findById: vi.fn(),
      list: vi.fn(),
    };
    const service = new TimelineService(repository);

    const event = await service.recordDomainEvent({
      type: "TaskAssigned",
      careSpaceId,
      taskId: "44444444-4444-4444-8444-444444444444",
      assignedTo: actorId,
      assignedBy: actorId,
      title: "Confirm transport",
      occurredAt: "2026-01-01T00:00:00.000Z",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        careSpaceId,
        eventType: "TaskAssigned",
        sourceDomain: "care-management",
        sourceId: "44444444-4444-4444-8444-444444444444",
        title: "Task assigned: Confirm transport",
      }),
    );
    expect(event.sourceDomain).toBe("care-management");
  });

  it("projects health records events into health-records timeline entries", async () => {
    const repository: TimelineRepository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "55555555-5555-4555-8555-555555555555",
        ...input,
        createdAt: "2026-01-01T00:00:00.000Z",
      })),
      findById: vi.fn(),
      list: vi.fn(),
    };
    const service = new TimelineService(repository);

    await service.recordDomainEvent({
      type: "DocumentUploaded",
      careSpaceId,
      documentId: "99999999-9999-4999-8999-999999999999",
      uploadedBy: actorId,
      occurredAt: "2026-01-01T00:00:00.000Z",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        careSpaceId,
        eventType: "DocumentUploaded",
        sourceDomain: "health-records",
        sourceId: "99999999-9999-4999-8999-999999999999",
        title: "Healthcare document uploaded",
        createdBy: actorId,
      }),
    );
  });

  it("authorizes feed access and passes pagination filters to the repository", async () => {
    const repository: TimelineRepository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue({ events: [], total: 0, limit: 20, offset: 0 }),
    };
    const service = new TimelineService(repository);

    await service.listFeed(actorId, { careSpaceId, limit: 20, offset: 0 });

    expect(repository.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(repository.list).toHaveBeenCalledWith(expect.objectContaining({ careSpaceId, limit: 20 }));
  });
});
