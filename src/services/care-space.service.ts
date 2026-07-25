import type {
  CareMember,
  CareSpace,
  CreateCareMemberInput,
  CreateCareSpaceInput,
  UpdateCareMemberInput,
  UpdateCareSpaceInput,
  User,
} from "@/domain/models";
import { forbidden, notFound } from "@/lib/errors";
import type {
  CareMemberRepository,
  CareSpaceRepository,
} from "@/repositories/types";

export class CareSpaceService {
  constructor(
    private readonly careSpaces: CareSpaceRepository,
    private readonly careMembers: CareMemberRepository,
  ) {}

  async createCareSpace(actor: User, input: CreateCareSpaceInput): Promise<CareSpace> {
    const careSpace = await this.careSpaces.create({
      name: input.name,
      description: input.description ?? null,
      ownerId: actor.id,
    });

    await this.careMembers.create({
      careSpaceId: careSpace.id,
      userId: actor.id,
      role: "owner",
    });

    return careSpace;
  }

  async listCareSpaces(actor: User): Promise<CareSpace[]> {
    return this.careSpaces.findByUserId(actor.id);
  }

  async getCareSpace(actor: User, careSpaceId: string): Promise<CareSpace> {
    await this.requireMembership(actor, careSpaceId);

    const careSpace = await this.careSpaces.findById(careSpaceId);

    if (!careSpace) {
      throw notFound("Care space not found.");
    }

    return careSpace;
  }

  async updateCareSpace(
    actor: User,
    careSpaceId: string,
    input: UpdateCareSpaceInput,
  ): Promise<CareSpace> {
    await this.requireOwner(actor, careSpaceId);

    const careSpace = await this.careSpaces.update(careSpaceId, input);

    if (!careSpace) {
      throw notFound("Care space not found.");
    }

    return careSpace;
  }

  async deleteCareSpace(actor: User, careSpaceId: string): Promise<void> {
    await this.requireOwner(actor, careSpaceId);
    await this.careSpaces.delete(careSpaceId);
  }

  async listCareMembers(actor: User, careSpaceId: string): Promise<CareMember[]> {
    await this.requireMembership(actor, careSpaceId);

    return this.careMembers.findByCareSpaceId(careSpaceId);
  }

  async getCareMember(
    actor: User,
    careSpaceId: string,
    careMemberId: string,
  ): Promise<CareMember> {
    await this.requireMembership(actor, careSpaceId);

    const careMember = await this.requireCareMemberInSpace(careSpaceId, careMemberId);

    return careMember;
  }

  async addCareMember(
    actor: User,
    careSpaceId: string,
    input: CreateCareMemberInput,
  ): Promise<CareMember> {
    await this.requireOwner(actor, careSpaceId);

    return this.careMembers.create({
      careSpaceId,
      userId: input.userId,
      role: input.role,
    });
  }

  async updateCareMember(
    actor: User,
    careSpaceId: string,
    careMemberId: string,
    input: UpdateCareMemberInput,
  ): Promise<CareMember> {
    await this.requireOwner(actor, careSpaceId);
    await this.requireCareMemberInSpace(careSpaceId, careMemberId);

    const careMember = await this.careMembers.update(careMemberId, input);

    if (!careMember) {
      throw notFound("Care member not found.");
    }

    return careMember;
  }

  async removeCareMember(
    actor: User,
    careSpaceId: string,
    careMemberId: string,
  ): Promise<void> {
    await this.requireOwner(actor, careSpaceId);
    await this.requireCareMemberInSpace(careSpaceId, careMemberId);

    await this.careMembers.delete(careMemberId);
  }

  private async requireMembership(actor: User, careSpaceId: string): Promise<CareMember> {
    const careMember = await this.careMembers.findByCareSpaceAndUser(
      careSpaceId,
      actor.id,
    );

    if (!careMember) {
      throw notFound("Care space not found.");
    }

    return careMember;
  }

  private async requireOwner(actor: User, careSpaceId: string): Promise<CareMember> {
    const careMember = await this.requireMembership(actor, careSpaceId);

    if (careMember.role !== "owner") {
      throw forbidden("Only care space owners can perform this action.");
    }

    return careMember;
  }

  private async requireCareMemberInSpace(
    careSpaceId: string,
    careMemberId: string,
  ): Promise<CareMember> {
    const careMember = await this.careMembers.findById(careMemberId);

    if (!careMember || careMember.careSpaceId !== careSpaceId) {
      throw notFound("Care member not found.");
    }

    return careMember;
  }
}
