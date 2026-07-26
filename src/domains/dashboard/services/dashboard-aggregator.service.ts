import { logger } from "@/lib/logger";
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

    // The snapshot is the caregiver's actual care data and must always be
    // returned. The briefing is an AI enhancement on top of it, so a briefing
    // failure degrades that one field instead of failing the whole dashboard.
    const [snapshot, briefingResult] = await Promise.all([
      this.repository.getDashboardSnapshot(careSpaceId),
      this.safeGenerateBriefing(actorId, careSpaceId),
    ]);

    return {
      ...snapshot,
      dailyBriefing: briefingResult,
      briefingUnavailable: briefingResult === null,
    };
  }

  private async safeGenerateBriefing(
    actorId: string,
    careSpaceId: string,
  ): Promise<DashboardResponse["dailyBriefing"]> {
    try {
      return await this.briefing.generateDailyBriefing(actorId, { careSpaceId });
    } catch (error) {
      logger.warn("dashboard.briefing.unavailable", {
        careSpaceId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}
