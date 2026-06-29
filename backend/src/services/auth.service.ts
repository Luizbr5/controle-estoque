import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { userRepository } from "@/repositories/user.repository";
import { signToken } from "@/middlewares/auth.middleware";
import { ApiError } from "@/utils/ApiError";
import type { AuthPayload, LoginDTO, RegisterDTO, UserResponseDTO } from "@/types/api.types";

const SALT_ROUNDS = 10;

export function toUserDTO(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt.toISOString(),
  };
}

export const authService = {
  async register(dto: RegisterDTO): Promise<AuthPayload> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw ApiError.duplicate("Já existe um usuário cadastrado com este e-mail");
    }

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });

    const token = signToken({ sub: user.id, name: user.name, email: user.email });
    return { user: toUserDTO(user), token };
  },

  async login(dto: LoginDTO): Promise<AuthPayload> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw ApiError.unauthorized("E-mail ou senha inválidos");
    }

    const matches = await bcrypt.compare(dto.password, user.password);
    if (!matches) {
      throw ApiError.unauthorized("E-mail ou senha inválidos");
    }

    const token = signToken({ sub: user.id, name: user.name, email: user.email });
    return { user: toUserDTO(user), token };
  },

  async me(userId: string): Promise<UserResponseDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.unauthorized("Usuário não encontrado");
    }
    return toUserDTO(user);
  },
};
