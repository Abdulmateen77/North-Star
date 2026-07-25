import { logger } from "@/lib/logger";

import type { DomainEvent, DomainEventPublisher } from "./domain-events";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: DomainEvent[] = [];

  publish(event: DomainEvent): void {
    this.events.push(event);
  }
}

export class LoggingEventPublisher implements DomainEventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    logger.info("domain.event.published", {
      type: event.type,
      careSpaceId: event.careSpaceId,
      occurredAt: event.occurredAt,
    });
  }
}

export class CompositeEventPublisher implements DomainEventPublisher {
  constructor(private readonly publishers: DomainEventPublisher[]) {}

  async publish(event: DomainEvent): Promise<void> {
    await Promise.all(this.publishers.map((publisher) => publisher.publish(event)));
  }
}
