import type { ActivityFeedItem } from "../types/models";
import type { ActivityRepository } from "../types/repositories";

export class ActivityService {
  constructor(private readonly activity: ActivityRepository) {}

  async listActivity(actorId: string, careSpaceId: string, limit: number, offset: number): Promise<ActivityFeedItem[]> {
    await this.activity.assertCareSpaceMember(careSpaceId, actorId);
    return this.activity.list(careSpaceId, limit, offset);
  }
}
