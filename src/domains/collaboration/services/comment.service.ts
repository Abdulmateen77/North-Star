import type { DomainEventPublisher } from "@/shared/events/domain-events";

import type { Comment, CreateCommentInput } from "../types/models";
import type { CommentRepository } from "../types/repositories";

export class CommentService {
  constructor(
    private readonly comments: CommentRepository,
    private readonly events: DomainEventPublisher,
  ) {}

  async createComment(actorId: string, input: CreateCommentInput): Promise<Comment> {
    await this.comments.assertCareSpaceMember(input.careSpaceId, actorId);
    const comment = await this.comments.create({ ...input, createdBy: actorId });
    await this.events.publish({
      type: "CommentCreated",
      careSpaceId: comment.careSpaceId,
      commentId: comment.id,
      targetType: comment.targetType,
      targetId: comment.targetId,
      createdBy: actorId,
      occurredAt: new Date().toISOString(),
    });
    return comment;
  }

  async listComments(actorId: string, careSpaceId: string, targetType?: string, targetId?: string): Promise<Comment[]> {
    await this.comments.assertCareSpaceMember(careSpaceId, actorId);
    return this.comments.list(careSpaceId, targetType, targetId);
  }
}
