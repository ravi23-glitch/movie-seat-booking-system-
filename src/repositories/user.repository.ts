import { inMemoryDb } from "@/lib/store";
import { UserDto, Role } from "@/types";

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

export class UserRepository {
  async findByEmail(email: string): Promise<(UserDto & { passwordHash: string }) | null> {
    const users = Array.from(inMemoryDb.state.users.values());
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findById(id: string): Promise<UserDto | null> {
    const user = inMemoryDb.state.users.get(id);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async create(data: CreateUserData): Promise<UserDto> {
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const user = {
      id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || ("USER" as Role),
      createdAt: new Date(),
    };
    inMemoryDb.state.users.set(id, user);
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

export const userRepository = new UserRepository();
