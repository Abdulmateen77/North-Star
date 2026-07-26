import { careSpaceIdParamSchema, updateCareSpaceSchema } from "@/domain/schemas";
import { jsonResponse, noContentResponse, withApiHandler } from "@/lib/http";
import {
  parseJsonBody,
  resolveRouteParams,
  validateParams,
} from "@/lib/validation";
import { getDefaultActor } from "@/services/auth.service";
import { createCareSpaceService } from "@/services/factory";

type CareSpaceRouteContext = {
  params: Promise<{ careSpaceId: string }> | { careSpaceId: string };
};

async function getCareSpaceId(context: CareSpaceRouteContext): Promise<string> {
  const params = await resolveRouteParams(context.params);
  return validateParams(params, careSpaceIdParamSchema).careSpaceId;
}

export async function GET(
  request: Request,
  context: CareSpaceRouteContext,
): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getDefaultActor();
    const careSpaceId = await getCareSpaceId(context);
    const careSpace = await createCareSpaceService().getCareSpace(actor, careSpaceId);

    return jsonResponse({ careSpace });
  });
}

export async function PATCH(
  request: Request,
  context: CareSpaceRouteContext,
): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getDefaultActor();
    const careSpaceId = await getCareSpaceId(context);
    const input = await parseJsonBody(request, updateCareSpaceSchema);
    const careSpace = await createCareSpaceService().updateCareSpace(
      actor,
      careSpaceId,
      input,
    );

    return jsonResponse({ careSpace });
  });
}

export async function DELETE(
  request: Request,
  context: CareSpaceRouteContext,
): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getDefaultActor();
    const careSpaceId = await getCareSpaceId(context);
    await createCareSpaceService().deleteCareSpace(actor, careSpaceId);

    return noContentResponse();
  });
}
