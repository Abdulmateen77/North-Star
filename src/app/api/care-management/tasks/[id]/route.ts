import { createCareManagementController, type IdRouteContext } from "@/domains/care-management";

export async function PATCH(request: Request, context: IdRouteContext): Promise<Response> {
  return createCareManagementController().updateTask(request, context);
}

export async function DELETE(request: Request, context: IdRouteContext): Promise<Response> {
  return createCareManagementController().deleteTask(request, context);
}
