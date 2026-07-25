import { AppError, notFound } from "@/lib/errors";

import type { CollaborationRole, Permission } from "../types/models";
import type { PermissionRepository } from "../types/repositories";

export class PermissionService {
  constructor(private readonly permissions: PermissionRepository) {}

  async updateRole(
    actorId: string,
    careSpaceId: string,
    userId: string,
    role: CollaborationRole,
  ): Promise<Permission> {
    await this.permissions.assertCareSpaceOwner(careSpaceId, actorId);

    const currentRole = await this.permissions.getMemberRole(careSpaceId, userId);
    if (!currentRole) {
      throw notFound("Care member not found.");
    }

    if (currentRole === "owner" && role !== "owner") {
      const ownerCount = await this.permissions.countOwners(careSpaceId);

      if (ownerCount <= 1) {
        throw new AppError({
          statusCode: 409,
          code: "LAST_OWNER_REQUIRED",
          message: "A care space must always have at least one owner.",
        });
      }
    }

    return this.permissions.updateRole(careSpaceId, userId, role);
  }
}
