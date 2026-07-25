import { createCollaborationController } from "@/domains/collaboration";

export async function GET(request: Request): Promise<Response> { return createCollaborationController().listActivity(request); }
