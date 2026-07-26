import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { userRepository } from "@/repositories/user.repository";
import { signToken } from "@/middlewares/auth.middleware";
import { ApiError } from "@/utils/ApiError";
import type { AuthPayload, LoginDTO, RegisterDTO, UserResponseDTO } from "@/types/api.types";

const SALT_ROUNDS = 10;

export function toUserDTO(user: User & { company?: { name: string } }): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    company_id: user.companyId,
    company_name: user.company?.name ?? "",
    role: user.role,
    created_at: user.createdAt.toISOString(),
  };
}

export const authService = {
  async register(dto: RegisterDTO): Promise<AuthPayload> {
    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await prisma.$transaction(async (tx) => {
      // 1. Criar company
      const slug = dto.company_name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      let company = await tx.company.findUnique({ where: { slug } });
      if (!company) {
        company = await tx.company.create({
          data: {
            name: dto.company_name,
            slug,
          },
        });
      }

      // 2. Verificar se email já existe nessa empresa
      const existing = await userRepository.findByEmail(dto.email, company.id, tx);
      if (existing) {
        throw ApiError.duplicate("Já existe um usuário cadastrado com este e-mail nessa empresa");
      }

      // 3. Criar usuário como OWNER (primeiro usuário da empresa)
      return userRepository.create(
        {
          companyId: company.id,
          name: dto.name,
          email: dto.email,
          password: hashed,
          role: "OWNER",
        },
        tx,
      );
    });

    // Buscar dados da empresa para retornar no DTO
    const company = await prisma.company.findUnique({ where: { id: user.companyId } });

    const token = signToken({
      sub: user.id,
      company_id: user.companyId,
      role: user.role,
      email: user.email,
    });

    return {
      user: toUserDTO({ ...user, company: company ?? { name: "" } }),
      token,
    };
  },

  async login(dto: LoginDTO): Promise<AuthPayload> {
    const user = await prisma.user.findFirst({
      where: { email: dto.email },
      include: { company: true },
    });

    if (!user) {
      throw ApiError.unauthorized("E-mail ou senha inválidos");
    }

    const matches = await bcrypt.compare(dto.password, user.password);
    if (!matches) {
      throw ApiError.unauthorized("E-mail ou senha inválidos");
    }

    const token = signToken({
      sub: user.id,
      company_id: user.companyId,
      role: user.role,
      email: user.email,
    });

    return {
      user: toUserDTO({ ...user, company: user.company }),
      token,
    };
  },

  async me(userId: string): Promise<UserResponseDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw ApiError.unauthorized("Usuário não encontrado");
    }

    return toUserDTO({ ...user, company: user.company });
  },
};
