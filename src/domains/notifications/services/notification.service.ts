import type { DomainEventPublisher } from "@/shared/events/domain-events";
import type { RealtimeGateway } from "@/shared/realtime/realtime-gateway";

import type { CreateSubscriptionInput, Notification, SendNotificationInput, Subscription } from "../types/models";
import type { NotificationRepository } from "../types/repositories";

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly realtime: RealtimeGateway,
    private readonly events: DomainEventPublisher,
  ) {}

  async send(actorId: string, input: SendNotificationInput): Promise<Notification> {
    await this.repository.assertCareSpaceMember(input.careSpaceId, actorId);
    await this.repository.assertCareSpaceMember(input.careSpaceId, input.recipientId);
    const notification = await this.repository.create(input);
    await this.realtime.broadcast(`care-space:${input.careSpaceId}`, {
      type: "notification.created",
      notification,
    });
    await this.events.publish({
      type: "NotificationSent",
      careSpaceId: notification.careSpaceId,
      notificationId: notification.id,
      recipientId: notification.recipientId,
      channel: notification.channel,
      title: notification.title,
      occurredAt: new Date().toISOString(),
    });
    return notification;
  }

  async subscribe(actorId: string, input: CreateSubscriptionInput): Promise<Subscription> {
    await this.repository.assertCareSpaceMember(input.careSpaceId, actorId);
    return this.repository.subscribe({ ...input, userId: actorId });
  }

  async list(actorId: string, careSpaceId: string): Promise<Notification[]> {
    await this.repository.assertCareSpaceMember(careSpaceId, actorId);
    return this.repository.list(careSpaceId, actorId);
  }
}
