import { createTimelineController } from "@/domains/timeline";

export async function GET(request: Request): Promise<Response> {
  return createTimelineController().list(request);
}
