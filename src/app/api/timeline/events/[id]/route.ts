import { createTimelineController, type TimelineEventRouteContext } from "@/domains/timeline";

export async function GET(request: Request, context: TimelineEventRouteContext): Promise<Response> {
  return createTimelineController().get(request, context);
}
