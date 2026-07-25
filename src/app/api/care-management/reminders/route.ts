import { createCareManagementController } from "@/domains/care-management";

export async function GET(request: Request): Promise<Response> {
  return createCareManagementController().listReminders(request);
}

export async function POST(request: Request): Promise<Response> {
  return createCareManagementController().createReminder(request);
}
