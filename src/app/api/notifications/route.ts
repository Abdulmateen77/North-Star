import { createNotificationController } from "@/domains/notifications";

export async function GET(request: Request): Promise<Response> { return createNotificationController().list(request); }
