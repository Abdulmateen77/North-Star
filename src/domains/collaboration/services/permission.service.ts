import type { CollaborationRole, Permission } from "../types/models";
import type { PermissionRepository } from "../types/repositories";

export class PermissionService {
  constructor(private readonly permissions: PermissionRepository) {}

  async updateRole(actorId: string, careSpaceId: string, userId: string, role: CollaborationRole): Promise<Permission> {
    await this.permissions.assertCareSpaceOwner(careSpaceId, actorId);
    return this.permissions.updateRole(careSpaceId, userId, role);
  }
}
