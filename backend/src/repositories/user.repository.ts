import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/config/prisma";

type Client = typeof prisma | Prisma.TransactionClient;

export const userRepository = {
  async findByEmail(email: string, client: Client = prisma): Promise<User | null> {
    return client.user.findUnique({ where: { email } });
  },

  async findById(id: string, client: Client = prisma): Promise<User | null> {
    return client.user.findUnique({ where: { id } });
  },

  async create(
    data: { name: string; email: string; password: string },
    client: Client = prisma,
  ): Promise<User> {
    return client.user.create({ data });
  },
};
