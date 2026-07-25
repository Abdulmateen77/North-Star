import { notFound } from "@/lib/errors";
import type { DomainEvent } from "@/shared/events/domain-events";

import { mapDomainEventToTimelineInput } from "./event-mapper";
import type { CreateTimelineEventInput, TimelineEvent, TimelineListFilters, TimelineListResult } from "../types/models";
import type { TimelineRepository } from "../types/repositories";

export class TimelineService {
  constructor(private readonly repository: TimelineRepository) {}

  async record(input: CreateTimelineEventInput): Promise<TimelineEvent> {
    return this.repository.create(input);
  }

  async recordDomainEvent(event: DomainEvent): Promise<TimelineEvent> {
    return this.repository.create(mapDomainEventToTimelineInput(event));
  }

  async listFeed(actorId: string, filters: TimelineListFilters): Promise<TimelineListResult> {
    await this.repository.assertCareSpaceMember(filters.careSpaceId, actorId);
    return this.repository.list(filters);
  }

  async getEvent(actorId: string, eventId: string): Promise<TimelineEvent> {
    const event = await this.repository.findById(eventId);
    if (!event) throw notFound("Timeline event not found.");
    await this.repository.assertCareSpaceMember(event.careSpaceId, actorId);
    return event;
  }
}
