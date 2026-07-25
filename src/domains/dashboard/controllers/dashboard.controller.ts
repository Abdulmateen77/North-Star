import { jsonResponse, withApiHandler } from "@/lib/http";
import { authenticateRequest } from "@/services/auth.service";

import { dashboardQuerySchema } from "../schemas/api.schema";
import type { DashboardAggregator } from "../services/dashboard-aggregator.service";

export class DashboardController {
  constructor(private readonly aggregator: DashboardAggregator) {}
  async get(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await authenticateRequest(request);
      const query = dashboardQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
      const dashboard = await this.aggregator.getDashboard(actor.id, query.careSpaceId);
      return jsonResponse(dashboard);
    });
  }
}
