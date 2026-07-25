import { createCollaborationController } from "@/domains/collaboration";

export async function PATCH(request: Request): Promise<Response> { return createCollaborationController().updatePermissions(request); }
