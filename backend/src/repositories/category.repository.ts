import type { Category, Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";

type Client = typeof prisma | Prisma.TransactionClient;

export const categoryRepository = {
  async findAll(client: Client = prisma): Promise<Category[]> {
    return client.category.findMany({ orderBy: { name: "asc" } });
  },

  async count(client: Client = prisma): Promise<number> {
    return client.category.count();
  },

  async findById(id: string, client: Client = prisma): Promise<Category | null> {
    return client.category.findUnique({ where: { id } });
  },

  /** Busca case-insensitive por nome (espelha a regra de duplicidade do contrato oficial). */
  async findByNameInsensitive(name: string, client: Client = prisma): Promise<Category | null> {
    return client.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  },

  async create(
    data: { name: string; description: string | null },
    client: Client = prisma,
  ): Promise<Category> {
    return client.category.create({ data });
  },

  async update(
    id: string,
    data: Partial<{ name: string; description: string | null }>,
    client: Client = prisma,
  ): Promise<Category> {
    return client.category.update({ where: { id }, data });
  },

  async remove(id: string, client: Client = prisma): Promise<void> {
    await client.category.delete({ where: { id } });
  },
};
