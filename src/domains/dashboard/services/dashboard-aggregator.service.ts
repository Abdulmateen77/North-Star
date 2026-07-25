import type { BriefingService } from "@/domains/ai-care-engine/services/briefing.service";

import type { DashboardRepository } from "../types/repositories";
import type { DashboardResponse } from "../types/models";

export class DashboardAggregator {
  constructor(
    private readonly repository: DashboardRepository,
    private readonly briefing: Pick<BriefingService, "generateDailyBriefing">,
  ) {}

  async getDashboard(actorId: string, careSpaceId: string): Promise<DashboardResponse> {
    await this.repository.assertCareSpaceMember(careSpaceId, actorId);
    const [snapshot, dailyBriefing] = await Promise.all([
      this.repository.getDashboardSnapshot(careSpaceId),
      this.briefing.generateDailyBriefing(actorId, { careSpaceId }),
    ]);
    return { ...snapshot, dailyBriefing };
  }
}
