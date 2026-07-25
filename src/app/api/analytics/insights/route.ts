import { createAnalyticsController } from "@/domains/analytics";

export async function GET(request: Request): Promise<Response> { return createAnalyticsController().insights(request); }
