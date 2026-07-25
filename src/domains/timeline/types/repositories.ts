import type { CreateTimelineEventInput, TimelineEvent, TimelineListFilters, TimelineListResult } from "./models";

export interface TimelineRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  create(input: CreateTimelineEventInput): Promise<TimelineEvent>;
  findById(id: string): Promise<TimelineEvent | null>;
  list(filters: TimelineListFilters): Promise<TimelineListResult>;
}
