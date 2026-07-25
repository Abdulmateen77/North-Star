import { jsonResponse, withApiHandler } from "@/lib/http";
import { resolveRouteParams, validateParams } from "@/lib/validation";
import { getDefaultActor } from "@/services/auth.service";

import { listTimelineQuerySchema, timelineEventIdParamSchema } from "../schemas/api.schema";
import type { TimelineService } from "../services/timeline.service";

export type TimelineEventRouteContext = { params: Promise<{ id: string }> | { id: string } };

function queryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export class TimelineController {
  constructor(private readonly service: TimelineService) {}

  async list(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor(request);
      const query = listTimelineQuerySchema.parse(queryObject(request));
      const result = await this.service.listFeed(actor.id, {
        careSpaceId: query.careSpaceId,
        eventType: query.eventType,
        sourceDomain: query.sourceDomain,
        limit: query.pageSize,
        offset: (query.page - 1) * query.pageSize,
      });
      return jsonResponse(result);
    });
  }

  async feed(request: Request): Promise<Response> {
    return this.list(request);
  }

  async get(request: Request, context: TimelineEventRouteContext): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor(request);
      const params = validateParams(await resolveRouteParams(context.params), timelineEventIdParamSchema);
      const event = await this.service.getEvent(actor.id, params.id);
      return jsonResponse({ event });
    });
  }
}
