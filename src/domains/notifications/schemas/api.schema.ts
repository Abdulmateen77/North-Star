import { z } from "zod";

import { notificationChannels } from "../types/models";

export const sendNotificationSchema = z.object({
  careSpaceId: z.string().uuid(),
  recipientId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  channel: z.enum(notificationChannels).default("in_app"),
});

export const subscriptionSchema = z.object({
  careSpaceId: z.string().uuid(),
  channel: z.enum(notificationChannels).default("in_app"),
  endpoint: z.string().trim().min(1).max(2000),
});

export const listNotificationsQuerySchema = z.object({ careSpaceId: z.string().uuid() });
