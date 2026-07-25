import { describe, expect, it, vi } from "vitest";

import { InvitationService } from "@/domains/collaboration/services/invitation.service";
import { CommentService } from "@/domains/collaboration/services/comment.service";
import type {
  InvitationRepository,
  CommentRepository,
} from "@/domains/collaboration/types/repositories";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";

describe("Family Collaboration services", () => {
  it("creates caregiver invitations scoped to a care space", async () => {
    const invitations: InvitationRepository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "66666666-6666-4666-8666-666666666666",
        ...input,
        status: "pending",
        acceptedAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        expiresAt: input.expiresAt,
      })),
      findByToken: vi.fn(),
      accept: vi.fn(),
      list: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const service = new InvitationService(invitations, events);

    const invitation = await service.invite(actorId, {
      careSpaceId,
      email: "caregiver@example.com",
      role: "caregiver",
    });

    expect(invitations.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(invitation.status).toBe("pending");
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "FamilyMemberInvited" }));
  });

  it("adds shared comments and publishes collaboration activity", async () => {
    const comments: CommentRepository = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "77777777-7777-4777-8777-777777777777",
        ...input,
        createdAt: "2026-01-01T00:00:00.000Z",
      })),
      list: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const service = new CommentService(comments, events);

    const comment = await service.createComment(actorId, {
      careSpaceId,
      body: "I called the clinic and updated the appointment notes.",
      targetType: "timeline_event",
      targetId: "88888888-8888-4888-8888-888888888888",
    });

    expect(comments.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(comment.body).toContain("clinic");
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "CommentCreated" }));
  });
});
