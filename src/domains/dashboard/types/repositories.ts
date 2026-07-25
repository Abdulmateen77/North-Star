import type { DashboardSnapshot } from "./models";

export interface DashboardRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  getDashboardSnapshot(careSpaceId: string): Promise<DashboardSnapshot>;
}
