import type { CreateSubscriptionInput, Notification, SendNotificationInput, Subscription } from "./models";

export interface NotificationRepository {
  assertCareSpaceMember(careSpaceId: string, userId: string): Promise<void>;
  create(input: SendNotificationInput): Promise<Notification>;
  list(careSpaceId: string, userId: string): Promise<Notification[]>;
  subscribe(input: CreateSubscriptionInput & { userId: string }): Promise<Subscription>;
}
