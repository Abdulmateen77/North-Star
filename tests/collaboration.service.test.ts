import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { InvitationService } from "@/domains/collaboration/services/invitation.service";
import { CommentService } from "@/domains/collaboration/services/comment.service";
import type {
  InvitationRepository,
  CommentRepository,
} from "@/domains/collaboration/types/repositories";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";
const invitationId = "66666666-6666-4666-8666-666666666666";
const token = "invitation-token-with-enough-length";

function buildInvitationRepository(overrides: Partial<InvitationRepository> = {}): InvitationRepository {
  return {
    assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockImplementation(async (input) => ({
      id: invitationId,
      ...input,
      status: "pending",
      acceptedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: input.expiresAt,
    })),
    findByToken: vi.fn().mockResolvedValue({
      id: invitationId,
      careSpaceId,
      email: "caregiver@example.com",
      role: "caregiver",
      invitedBy: actorId,
      token,
      status: "pending",
      expiresAt: "2026-02-01T00:00:00.000Z",
      acceptedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    }),
    accept: vi.fn().mockImplementation(async (acceptedInvitationId, acceptedBy) => ({
      id: acceptedInvitationId,
      careSpaceId,
      email: "caregiver@example.com",
      role: "caregiver",
      invitedBy: actorId,
      token,
      status: "accepted",
      expiresAt: "2026-02-01T00:00:00.000Z",
      acceptedAt: "2026-01-02T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      acceptedBy,
    })),
    list: vi.fn(),
    ...overrides,
  };
}

describe("Family Collaboration services", () => {
  it("creates caregiver invitations scoped to a care space", async () => {
    const invitations = buildInvitationRepository();
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

  it("accepts pending invitations, adds membership through the repository, and publishes acceptance", async () => {
    const invitations = buildInvitationRepository();
    const events = { publish: vi.fn() };
    const service = new InvitationService(invitations, events, () => new Date("2026-01-02T00:00:00.000Z"));

    const invitation = await service.acceptInvitation(actorId, token);

    expect(invitations.findByToken).toHaveBeenCalledWith(token);
    expect(invitations.accept).toHaveBeenCalledWith(invitationId, actorId);
    expect(invitation.status).toBe("accepted");
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "InvitationAccepted",
        careSpaceId,
        invitationId,
        acceptedBy: actorId,
      }),
    );
  });

  it("rejects expired invitations", async () => {
    const invitations = buildInvitationRepository({
      findByToken: vi.fn().mockResolvedValue({
        id: invitationId,
        careSpaceId,
        email: "caregiver@example.com",
        role: "caregiver",
        invitedBy: actorId,
        token,
        status: "pending",
        expiresAt: "2026-01-01T00:00:00.000Z",
        acceptedAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
    });
    const service = new InvitationService(invitations, { publish: vi.fn() }, () => new Date("2026-01-02T00:00:00.000Z"));

    await expect(service.acceptInvitation(actorId, token)).rejects.toMatchObject({
      statusCode: 410,
      code: "INVITATION_EXPIRED",
    } satisfies Partial<AppError>);
    expect(invitations.accept).not.toHaveBeenCalled();
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
