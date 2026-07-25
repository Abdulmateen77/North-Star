import type { DomainEvent, DomainEventPublisher } from "@/shared/events/domain-events";

import type { TimelineService } from "./timeline.service";

export class TimelineEventPublisher implements DomainEventPublisher {
  constructor(private readonly timeline: TimelineService) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.timeline.recordDomainEvent(event);
  }
}
