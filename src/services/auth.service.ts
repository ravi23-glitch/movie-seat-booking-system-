import bcrypt from "bcryptjs";
import { userRepository, CreateUserData } from "@/repositories/user.repository";
import { signToken } from "@/lib/jwt";
import { ConflictError, UnauthorizedError, NotFoundError } from "@/lib/errors";
import { UserDto } from "@/types";

export class AuthService {
  async register(data: { name: string; email: string; password: string }): Promise<{
    user: UserDto;
    token: string;
  }> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: "USER",
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(data: { email: string; password: string }): Promise<{
    user: UserDto;
    token: string;
  }> {
    const userWithHash = await userRepository.findByEmail(data.email);
    if (!userWithHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await bcrypt.compare(data.password, userWithHash.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { passwordHash, ...user } = userWithHash;
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async getCurrentUser(userId: string): Promise<UserDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }
}

export const authService = new AuthService();
