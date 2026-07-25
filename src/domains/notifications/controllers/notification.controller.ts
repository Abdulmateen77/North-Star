import { jsonResponse, withApiHandler } from "@/lib/http";
import { parseJsonBody } from "@/lib/validation";
import { authenticateRequest } from "@/services/auth.service";

import { listNotificationsQuerySchema, sendNotificationSchema, subscriptionSchema } from "../schemas/api.schema";
import type { NotificationService } from "../services/notification.service";

function queryObject(request: Request) { return Object.fromEntries(new URL(request.url).searchParams.entries()); }

export class NotificationController {
  constructor(private readonly service: NotificationService) {}
  async send(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await authenticateRequest(request); const input = await parseJsonBody(request, sendNotificationSchema); const notification = await this.service.send(actor.id, input); return jsonResponse({ notification }, 201); }); }
  async subscribe(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await authenticateRequest(request); const input = await parseJsonBody(request, subscriptionSchema); const subscription = await this.service.subscribe(actor.id, input); return jsonResponse({ subscription }, 201); }); }
  async list(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await authenticateRequest(request); const query = listNotificationsQuerySchema.parse(queryObject(request)); const notifications = await this.service.list(actor.id, query.careSpaceId); return jsonResponse({ notifications }); }); }
}
