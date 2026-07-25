import { createCareManagementController, type IdRouteContext } from "@/domains/care-management";

export async function POST(request: Request, context: IdRouteContext): Promise<Response> {
  return createCareManagementController().triggerReminder(request, context);
}
