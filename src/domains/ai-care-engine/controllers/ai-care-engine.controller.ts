import { jsonResponse, withApiHandler } from "@/lib/http";
import { parseJsonBody } from "@/lib/validation";
import { getDefaultActor } from "@/services/auth.service";

import { assistantChatSchema, briefingSchema } from "../schemas/api.schema";
import type { AssistantService } from "../services/assistant.service";
import type { BriefingService } from "../services/briefing.service";

export class AICareEngineController {
  constructor(private readonly assistant: AssistantService, private readonly briefing: BriefingService) {}

  async chat(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const input = await parseJsonBody(request, assistantChatSchema);
      const response = await this.assistant.chat(actor.id, input);
      return jsonResponse(response);
    });
  }

  async briefingForToday(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const input = await parseJsonBody(request, briefingSchema);
      const response = await this.briefing.generateDailyBriefing(actor.id, input);
      return jsonResponse(response);
    });
  }
}
