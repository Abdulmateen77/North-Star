import { createCareManagementController } from "@/domains/care-management";

export async function POST(request: Request): Promise<Response> {
  return createCareManagementController().processDueReminders(request);
}
