import { createCollaborationController } from "@/domains/collaboration";

export async function POST(request: Request): Promise<Response> {
  return createCollaborationController().acceptInvitation(request);
}
