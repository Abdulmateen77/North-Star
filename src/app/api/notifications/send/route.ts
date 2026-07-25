import { createNotificationController } from "@/domains/notifications";

export async function POST(request: Request): Promise<Response> { return createNotificationController().send(request); }
