import { describe, expect, it, vi } from "vitest";

import type { User } from "@/domain/models";
import type {
  CareMemberRepository,
  CareSpaceRepository,
} from "@/repositories/types";
import { CareSpaceService } from "@/services/care-space.service";

const actor: User = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "owner@example.com",
  fullName: "Owner User",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const careSpace = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Mum care",
  description: "Medication and appointment coordination",
  ownerId: actor.id,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function buildService() {
  const careSpaces: CareSpaceRepository = {
    create: vi.fn().mockResolvedValue(careSpace),
    findById: vi.fn().mockResolvedValue(careSpace),
    findByUserId: vi.fn().mockResolvedValue([careSpace]),
    update: vi.fn().mockResolvedValue({ ...careSpace, name: "Updated" }),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  const careMembers: CareMemberRepository = {
    create: vi.fn().mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
      careSpaceId: careSpace.id,
      userId: actor.id,
      role: "owner",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
    findById: vi.fn().mockResolvedValue(null),
    findByCareSpaceAndUser: vi.fn().mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
      careSpaceId: careSpace.id,
      userId: actor.id,
      role: "owner",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
    findByCareSpaceId: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  return {
    careSpaces,
    careMembers,
    service: new CareSpaceService(careSpaces, careMembers),
  };
}

describe("CareSpaceService", () => {
  it("creates a care space owned by the authenticated user and adds an owner member", async () => {
    const { careSpaces, careMembers, service } = buildService();

    const result = await service.createCareSpace(actor, {
      name: "Mum care",
      description: "Medication and appointment coordination",
    });

    expect(result).toEqual(careSpace);
    expect(careSpaces.create).toHaveBeenCalledWith({
      name: "Mum care",
      description: "Medication and appointment coordination",
      ownerId: actor.id,
    });
    expect(careMembers.create).toHaveBeenCalledWith({
      careSpaceId: careSpace.id,
      userId: actor.id,
      role: "owner",
    });
  });

  it("lists only care spaces visible to the authenticated user", async () => {
    const { careSpaces, service } = buildService();

    const result = await service.listCareSpaces(actor);

    expect(result).toEqual([careSpace]);
    expect(careSpaces.findByUserId).toHaveBeenCalledWith(actor.id);
  });

  it("blocks care space updates when the authenticated user is not an owner", async () => {
    const { careSpaces, careMembers, service } = buildService();
    vi.mocked(careMembers.findByCareSpaceAndUser).mockResolvedValueOnce({
      id: "44444444-4444-4444-8444-444444444444",
      careSpaceId: careSpace.id,
      userId: actor.id,
      role: "viewer",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    await expect(
      service.updateCareSpace(actor, careSpace.id, { name: "Updated" }),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
    expect(careSpaces.update).not.toHaveBeenCalled();
  });

  it("lets care space members read members and requires owners to add members", async () => {
    const { careMembers, service } = buildService();

    await service.listCareMembers(actor, careSpace.id);
    expect(careMembers.findByCareSpaceId).toHaveBeenCalledWith(careSpace.id);

    await service.addCareMember(actor, careSpace.id, {
      userId: "55555555-5555-4555-8555-555555555555",
      role: "caregiver",
    });
    expect(careMembers.create).toHaveBeenLastCalledWith({
      careSpaceId: careSpace.id,
      userId: "55555555-5555-4555-8555-555555555555",
      role: "caregiver",
    });
  });
});
