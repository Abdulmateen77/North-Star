import { createCareSpaceSchema } from "@/domain/schemas";
import { jsonResponse, withApiHandler } from "@/lib/http";
import { parseJsonBody } from "@/lib/validation";
import { getActorFromRequest } from "@/services/auth.service";
import { createCareSpaceService } from "@/services/factory";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const careSpaces = await createCareSpaceService().listCareSpaces(actor);

    return jsonResponse({ careSpaces });
  });
}

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const input = await parseJsonBody(request, createCareSpaceSchema);
    const careSpace = await createCareSpaceService().createCareSpace(actor, input);

    return jsonResponse({ careSpace }, 201);
  });
}
