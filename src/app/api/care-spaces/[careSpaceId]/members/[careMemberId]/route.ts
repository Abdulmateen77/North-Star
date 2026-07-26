import { careMemberIdParamSchema, updateCareMemberSchema } from "@/domain/schemas";
import { jsonResponse, noContentResponse, withApiHandler } from "@/lib/http";
import {
  parseJsonBody,
  resolveRouteParams,
  validateParams,
} from "@/lib/validation";
import { getActorFromRequest } from "@/services/auth.service";
import { createCareSpaceService } from "@/services/factory";

type CareMemberRouteContext = {
  params:
    | Promise<{ careSpaceId: string; careMemberId: string }>
    | { careSpaceId: string; careMemberId: string };
};

async function getIds(context: CareMemberRouteContext) {
  const params = await resolveRouteParams(context.params);
  return validateParams(params, careMemberIdParamSchema);
}

export async function GET(
  request: Request,
  context: CareMemberRouteContext,
): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const { careSpaceId, careMemberId } = await getIds(context);
    const careMember = await createCareSpaceService().getCareMember(
      actor,
      careSpaceId,
      careMemberId,
    );

    return jsonResponse({ careMember });
  });
}

export async function PATCH(
  request: Request,
  context: CareMemberRouteContext,
): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const { careSpaceId, careMemberId } = await getIds(context);
    const input = await parseJsonBody(request, updateCareMemberSchema);
    const careMember = await createCareSpaceService().updateCareMember(
      actor,
      careSpaceId,
      careMemberId,
      input,
    );

    return jsonResponse({ careMember });
  });
}

export async function DELETE(
  request: Request,
  context: CareMemberRouteContext,
): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const { careSpaceId, careMemberId } = await getIds(context);
    await createCareSpaceService().removeCareMember(actor, careSpaceId, careMemberId);

    return noContentResponse();
  });
}
