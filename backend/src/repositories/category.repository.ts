import type { Category, Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";

type Client = typeof prisma | Prisma.TransactionClient;

export const categoryRepository = {
  async findAll(companyId: string, client: Client = prisma): Promise<Category[]> {
    return client.category.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
  },

  async count(companyId: string, client: Client = prisma): Promise<number> {
    return client.category.count({ where: { companyId } });
  },

  async findById(
    id: string,
    companyId: string,
    client: Client = prisma,
  ): Promise<Category | null> {
    return client.category.findFirst({
      where: { id, companyId },
    });
  },

  async findByNameInsensitive(
    name: string,
    companyId: string,
    client: Client = prisma,
  ): Promise<Category | null> {
    return client.category.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: "insensitive" },
      },
    });
  },

  async create(
    data: { companyId: string; name: string; description: string | null },
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