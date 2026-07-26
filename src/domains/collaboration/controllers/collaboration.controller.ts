import { jsonResponse, withApiHandler } from "@/lib/http";
import { parseJsonBody } from "@/lib/validation";
import { getDefaultActor } from "@/services/auth.service";

import { acceptInvitationSchema, activityQuerySchema, createCommentSchema, createInvitationSchema, listCommentQuerySchema, updatePermissionSchema } from "../schemas/api.schema";
import type { ActivityService } from "../services/activity.service";
import type { CommentService } from "../services/comment.service";
import type { InvitationService } from "../services/invitation.service";
import type { PermissionService } from "../services/permission.service";

function queryObject(request: Request) { return Object.fromEntries(new URL(request.url).searchParams.entries()); }

export class CollaborationController {
  constructor(private readonly invitations: InvitationService, private readonly permissions: PermissionService, private readonly activity: ActivityService, private readonly comments: CommentService) {}

  async invite(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await getDefaultActor(); const input = await parseJsonBody(request, createInvitationSchema); const invitation = await this.invitations.invite(actor.id, input); return jsonResponse({ invitation }, 201); }); }
  async acceptInvitation(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await getDefaultActor(); const input = await parseJsonBody(request, acceptInvitationSchema); const invitation = await this.invitations.acceptInvitation(actor.id, input.token); return jsonResponse({ invitation }); }); }
  async updatePermissions(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await getDefaultActor(); const input = await parseJsonBody(request, updatePermissionSchema); const permission = await this.permissions.updateRole(actor.id, input.careSpaceId, input.userId, input.role); return jsonResponse({ permission }); }); }
  async listActivity(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await getDefaultActor(); const query = activityQuerySchema.parse(queryObject(request)); const activity = await this.activity.listActivity(actor.id, query.careSpaceId, query.pageSize, (query.page - 1) * query.pageSize); return jsonResponse({ activity }); }); }
  async createComment(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await getDefaultActor(); const input = await parseJsonBody(request, createCommentSchema); const comment = await this.comments.createComment(actor.id, input); return jsonResponse({ comment }, 201); }); }
  async listComments(request: Request): Promise<Response> { return withApiHandler(request, async () => { const actor = await getDefaultActor(); const query = listCommentQuerySchema.parse(queryObject(request)); const comments = await this.comments.listComments(actor.id, query.careSpaceId, query.targetType, query.targetId); return jsonResponse({ comments }); }); }
}
