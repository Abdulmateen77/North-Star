import { jsonResponse, withApiHandler } from "@/lib/http";
import { getDefaultActor } from "@/services/auth.service";
import { z } from "zod";

import type { AnalyticsService } from "../services/analytics.service";

const querySchema = z.object({ careSpaceId: z.string().uuid() });

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}
  async insights(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const query = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
      const result = await this.service.generateInsights(actor.id, query.careSpaceId);
      return jsonResponse(result);
    });
  }
}
