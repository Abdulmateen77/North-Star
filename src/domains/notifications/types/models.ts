export const notificationChannels = ["in_app", "email", "push"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export interface Notification {
  id: string;
  careSpaceId: string;
  recipientId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  readAt: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  careSpaceId: string;
  userId: string;
  channel: NotificationChannel;
  endpoint: string;
  createdAt: string;
}

export interface SendNotificationInput {
  careSpaceId: string;
  recipientId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
}

export interface CreateSubscriptionInput {
  careSpaceId: string;
  channel: NotificationChannel;
  endpoint: string;
}
