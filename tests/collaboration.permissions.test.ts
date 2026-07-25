import { describe, expect, it, vi } from "vitest";

import { InvitationService } from "@/domains/collaboration/services/invitation.service";
import { PermissionService } from "@/domains/collaboration/services/permission.service";
import type {
  InvitationRepository,
  PermissionRepository,
} from "@/domains/collaboration/types/repositories";
import type { CollaborationRole } from "@/domains/collaboration/types/models";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";
const targetUserId = "99999999-9999-4999-8999-999999999999";
const invitationId = "66666666-6666-4666-8666-666666666666";

function buildInvitationRepository(
  actorRole: CollaborationRole | null,
  overrides: Partial<InvitationRepository> = {},
): InvitationRepository {
  return {
    assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
    getMemberRole: vi.fn().mockResolvedValue(actorRole),
    create: vi.fn().mockImplementation(async (input) => ({
      id: invitationId,
      ...input,
      status: "pending",
      acceptedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    })),
    findByToken: vi.fn(),
    accept: vi.fn(),
    list: vi.fn(),
    ...overrides,
  };
}

function buildPermissionRepository(
  ownerCount: number,
  targetRole: CollaborationRole | null,
  overrides: Partial<PermissionRepository> = {},
): PermissionRepository {
  return {
    assertCareSpaceOwner: vi.fn().mockResolvedValue(undefined),
    getMemberRole: vi.fn().mockResolvedValue(targetRole),
    countOwners: vi.fn().mockResolvedValue(ownerCount),
    updateRole: vi.fn().mockImplementation(async (space, user, role) => ({
      careSpaceId: space,
      userId: user,
      role,
    })),
    ...overrides,
  };
}

describe("Collaboration permission enforcement", () => {
  it("allows owners to invite new family members", async () => {
    const invitations = buildInvitationRepository("owner");
    const service = new InvitationService(invitations, { publish: vi.fn() });

    const invitation = await service.invite(actorId, {
      careSpaceId,
      email: "caregiver@example.com",
      role: "caregiver",
    });

    expect(invitation.status).toBe("pending");
    expect(invitations.create).toHaveBeenCalled();
  });

  it("allows caregivers to invite new family members", async () => {
    const invitations = buildInvitationRepository("caregiver");
    const service = new InvitationService(invitations, { publish: vi.fn() });

    await expect(
      service.invite(actorId, {
        careSpaceId,
        email: "caregiver@example.com",
        role: "viewer",
      }),
    ).resolves.toMatchObject({ status: "pending" });
  });

  it("forbids viewers from inviting new family members", async () => {
    const invitations = buildInvitationRepository("viewer");
    const events = { publish: vi.fn() };
    const service = new InvitationService(invitations, events);

    await expect(
      service.invite(actorId, {
        careSpaceId,
        email: "caregiver@example.com",
        role: "caregiver",
      }),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });

    expect(invitations.create).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("forbids non-owners from inviting someone as an owner", async () => {
    const invitations = buildInvitationRepository("caregiver");
    const service = new InvitationService(invitations, { publish: vi.fn() });

    await expect(
      service.invite(actorId, {
        careSpaceId,
        email: "new-owner@example.com",
        role: "owner",
      }),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });

    expect(invitations.create).not.toHaveBeenCalled();
  });

  it("refuses to demote the last remaining owner", async () => {
    const permissions = buildPermissionRepository(1, "owner");
    const service = new PermissionService(permissions);

    await expect(
      service.updateRole(actorId, careSpaceId, targetUserId, "caregiver"),
    ).rejects.toMatchObject({ statusCode: 409, code: "LAST_OWNER_REQUIRED" });

    expect(permissions.updateRole).not.toHaveBeenCalled();
  });

  it("allows demoting an owner when another owner remains", async () => {
    const permissions = buildPermissionRepository(2, "owner");
    const service = new PermissionService(permissions);

    const permission = await service.updateRole(actorId, careSpaceId, targetUserId, "caregiver");

    expect(permission.role).toBe("caregiver");
    expect(permissions.updateRole).toHaveBeenCalledWith(careSpaceId, targetUserId, "caregiver");
  });

  it("rejects role updates for users who are not care-space members", async () => {
    const permissions = buildPermissionRepository(2, null);
    const service = new PermissionService(permissions);

    await expect(
      service.updateRole(actorId, careSpaceId, targetUserId, "caregiver"),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });

    expect(permissions.updateRole).not.toHaveBeenCalled();
  });

  it("is a no-op guard when the target already holds the requested role", async () => {
    const permissions = buildPermissionRepository(1, "owner");
    const service = new PermissionService(permissions);

    const permission = await service.updateRole(actorId, careSpaceId, targetUserId, "owner");

    expect(permission.role).toBe("owner");
    expect(permissions.updateRole).toHaveBeenCalledWith(careSpaceId, targetUserId, "owner");
  });
});
