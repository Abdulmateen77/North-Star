import { careSpaceIdParamSchema, createCareMemberSchema } from "@/domain/schemas";
import { jsonResponse, withApiHandler } from "@/lib/http";
import {
  parseJsonBody,
  resolveRouteParams,
  validateParams,
} from "@/lib/validation";
import { getActorFromRequest } from "@/services/auth.service";
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
    const actor = await getActorFromRequest(request);
    const careSpaceId = await getCareSpaceId(context);
    const careMembers = await createCareSpaceService().listCareMembers(
      actor,
      careSpaceId,
    );

    return jsonResponse({ careMembers });
  });
}

export async function POST(
  request: Request,
  context: CareSpaceRouteContext,
): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const careSpaceId = await getCareSpaceId(context);
    const input = await parseJsonBody(request, createCareMemberSchema);
    const careMember = await createCareSpaceService().addCareMember(
      actor,
      careSpaceId,
      input,
    );

    return jsonResponse({ careMember }, 201);
  });
}
