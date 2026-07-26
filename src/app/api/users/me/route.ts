import { updateUserSchema } from "@/domain/schemas";
import { jsonResponse, noContentResponse, withApiHandler } from "@/lib/http";
import { parseJsonBody } from "@/lib/validation";
import { getActorFromRequest } from "@/services/auth.service";
import { createUserService } from "@/services/factory";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const user = await createUserService().getCurrentUser(actor);

    return jsonResponse({ user });
  });
}

export async function PATCH(request: Request): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    const input = await parseJsonBody(request, updateUserSchema);
    const user = await createUserService().updateCurrentUser(actor, input);

    return jsonResponse({ user });
  });
}

export async function DELETE(request: Request): Promise<Response> {
  return withApiHandler(request, async () => {
    const actor = await getActorFromRequest(request);
    await createUserService().deleteCurrentUser(actor);

    return noContentResponse();
  });
}
