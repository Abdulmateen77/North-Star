import type { UpdateUserInput, User } from "@/domain/models";
import type { UserRepository } from "@/repositories/types";

export class UserService {
  constructor(private readonly users: UserRepository) {}

  async getCurrentUser(authUser: User): Promise<User> {
    const profile = await this.users.findById(authUser.id);

    return profile ?? authUser;
  }

  async updateCurrentUser(authUser: User, input: UpdateUserInput): Promise<User> {
    const existing = await this.getCurrentUser(authUser);

    return this.users.upsert({
      ...existing,
      ...input,
      id: authUser.id,
      email: authUser.email,
    });
  }

  async deleteCurrentUser(authUser: User): Promise<void> {
    await this.users.delete(authUser.id);
  }
}
