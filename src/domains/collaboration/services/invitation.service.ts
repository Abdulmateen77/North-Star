import { randomBytes } from "node:crypto";

import type { DomainEventPublisher } from "@/shared/events/domain-events";

import type { CreateInvitationInput, Invitation } from "../types/models";
import type { InvitationRepository } from "../types/repositories";

const DEFAULT_INVITATION_DAYS = 7;

export class InvitationService {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly events: DomainEventPublisher,
  ) {}

  async invite(actorId: string, input: CreateInvitationInput): Promise<Invitation> {
    await this.invitations.assertCareSpaceMember(input.careSpaceId, actorId);
    const expiresAt =
      input.expiresAt ??
      new Date(Date.now() + DEFAULT_INVITATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const invitation = await this.invitations.create({
      ...input,
      invitedBy: actorId,
      token: randomBytes(24).toString("hex"),
      expiresAt,
    });

    await this.events.publish({
      type: "FamilyMemberInvited",
      careSpaceId: invitation.careSpaceId,
      invitationId: invitation.id,
      email: invitation.email,
      role: invitation.role,
      invitedBy: actorId,
      occurredAt: new Date().toISOString(),
    });

    return invitation;
  }
}
