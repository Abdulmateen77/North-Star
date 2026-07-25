import type { AnalyticsSnapshot } from "./models";
export interface AnalyticsRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  getAnalyticsSnapshot(careSpaceId: string): Promise<AnalyticsSnapshot>;
}
