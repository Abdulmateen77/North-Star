import { createCollaborationController } from "@/domains/collaboration";

export async function GET(request: Request): Promise<Response> { return createCollaborationController().listComments(request); }

export async function POST(request: Request): Promise<Response> { return createCollaborationController().createComment(request); }
