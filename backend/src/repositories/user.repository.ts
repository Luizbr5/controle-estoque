import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/config/prisma";

type Client = typeof prisma | Prisma.TransactionClient;

export const userRepository = {
  async findByEmail(
    email: string,
    companyId?: string,
    client: Client = prisma,
  ): Promise<User | null> {
    if (companyId) {
      return client.user.findUnique({
        where: { companyId_email: { companyId, email } },
      });
    }
    return client.user.findFirst({ where: { email } });
  },

  async findById(id: string, client: Client = prisma): Promise<User | null> {
    return client.user.findUnique({ where: { id } });
  },

  async create(
    data: {
      companyId: string;
      name: string;
      email: string;
      password: string;
      role?: "OWNER" | "ADMIN" | "EMPLOYEE";
    },
    client: Client = prisma,
  ): Promise<User> {
    return client.user.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? "EMPLOYEE",
      },
    });
  },
};
