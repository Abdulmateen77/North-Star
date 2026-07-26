import { randomBytes } from "node:crypto";

import { AppError, conflict, forbidden, notFound } from "@/lib/errors";
import type { DomainEventPublisher } from "@/shared/events/domain-events";

import type { CreateInvitationInput, Invitation } from "../types/models";
import type { InvitationRepository } from "../types/repositories";

const DEFAULT_INVITATION_DAYS = 7;
const ROLES_ALLOWED_TO_INVITE = new Set(["owner", "caregiver"]);

export class InvitationService {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly events: DomainEventPublisher,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async invite(actorId: string, input: CreateInvitationInput): Promise<Invitation> {
    await this.invitations.assertCareSpaceMember(input.careSpaceId, actorId);

    const actorRole = await this.invitations.getMemberRole(input.careSpaceId, actorId);
    if (!actorRole) {
      throw notFound("Care space not found.");
    }

    if (!ROLES_ALLOWED_TO_INVITE.has(actorRole)) {
      throw forbidden("Viewers cannot invite family members.");
    }

    if (input.role === "owner" && actorRole !== "owner") {
      throw forbidden("Only owners can invite another owner.");
    }

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

  async acceptInvitation(actorId: string, token: string): Promise<Invitation> {
    const invitation = await this.invitations.findByToken(token);

    if (!invitation) {
      throw notFound("Invitation not found.");
    }

    if (invitation.status !== "pending") {
      throw conflict("Invitation is no longer pending.", { status: invitation.status });
    }

    if (new Date(invitation.expiresAt).getTime() <= this.now().getTime()) {
      throw new AppError({
        statusCode: 410,
        code: "INVITATION_EXPIRED",
        message: "Invitation has expired.",
      });
    }

    const accepted = await this.invitations.accept(invitation.id, actorId);

    await this.events.publish({
      type: "InvitationAccepted",
      careSpaceId: accepted.careSpaceId,
      invitationId: accepted.id,
      acceptedBy: actorId,
      occurredAt: new Date().toISOString(),
    });

    return accepted;
  }
}
