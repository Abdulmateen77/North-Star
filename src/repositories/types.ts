import type {
  CareMember,
  CareMemberRole,
  CareSpace,
  CreateCareMemberInput,
  CreateCareSpaceInput,
  UpdateCareMemberInput,
  UpdateCareSpaceInput,
  UpdateUserInput,
  User,
} from "@/domain/models";

export interface CreateCareSpaceRecord extends CreateCareSpaceInput {
  ownerId: string;
}

export interface CreateCareMemberRecord extends CreateCareMemberInput {
  careSpaceId: string;
}

export interface CareSpaceRepository {
  create(input: CreateCareSpaceRecord): Promise<CareSpace>;
  findById(id: string): Promise<CareSpace | null>;
  findByUserId(userId: string): Promise<CareSpace[]>;
  update(id: string, input: UpdateCareSpaceInput): Promise<CareSpace | null>;
  delete(id: string): Promise<void>;
}

export interface CareMemberRepository {
  create(input: CreateCareMemberRecord): Promise<CareMember>;
  findById(id: string): Promise<CareMember | null>;
  findByCareSpaceAndUser(careSpaceId: string, userId: string): Promise<CareMember | null>;
  findByCareSpaceId(careSpaceId: string): Promise<CareMember[]>;
  update(id: string, input: UpdateCareMemberInput): Promise<CareMember | null>;
  delete(id: string): Promise<void>;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  upsert(user: User): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  delete(id: string): Promise<void>;
}

export type { CareMemberRole };
