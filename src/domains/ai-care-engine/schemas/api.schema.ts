import { z } from "zod";

export const assistantChatSchema = z.object({
  careSpaceId: z.string().uuid(),
  question: z.string().trim().min(1).max(1000),
});

export const briefingSchema = z.object({ careSpaceId: z.string().uuid() });
