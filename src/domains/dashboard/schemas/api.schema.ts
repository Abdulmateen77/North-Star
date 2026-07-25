import { z } from "zod";
export const dashboardQuerySchema = z.object({ careSpaceId: z.string().uuid() });
