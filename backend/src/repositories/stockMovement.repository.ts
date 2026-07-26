import type { Prisma, StockMovement } from "@prisma/client";
import { prisma } from "@/config/prisma";

type Client = typeof prisma | Prisma.TransactionClient;

const includeRelations = {
  product: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
} satisfies Prisma.StockMovementInclude;

export type StockMovementWithRelations = Prisma.StockMovementGetPayload<{
  include: typeof includeRelations;
}>;

export interface StockMovementFilters {
  companyId: string;
  productId?: string;
  type?: "IN" | "OUT" | "ADJUSTMENT";
  startDate?: Date;
  endDate?: Date;
}

function buildWhere(filters: StockMovementFilters): Prisma.StockMovementWhereInput {
  const where: Prisma.StockMovementWhereInput = {
    companyId: filters.companyId,
    ...(filters.productId && { productId: filters.productId }),
    ...(filters.type && { type: filters.type }),
    ...(filters.startDate || filters.endDate) && {
      createdAt: {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      },
    },
  };
  return where;
}

export const stockMovementRepository = {
  async findManyPaginated(
    filters: StockMovementFilters,
    pagination: { skip: number; take: number },
    client: Client = prisma,
  ): Promise<{ rows: StockMovementWithRelations[]; total: number }> {
    const where = buildWhere(filters);
    const [rows, total] = await Promise.all([
      client.stockMovement.findMany({
        where,
        include: includeRelations,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      client.stockMovement.count({ where }),
    ]);
    return { rows, total };
  },

  async findRecent(
    companyId: string,
    limit: number,
    client: Client = prisma,
  ): Promise<StockMovementWithRelations[]> {
    return client.stockMovement.findMany({
      where: { companyId },
      include: includeRelations,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async create(
    data: Prisma.StockMovementCreateInput,
    client: Client = prisma,
  ): Promise<StockMovementWithRelations> {
    return client.stockMovement.create({ data, include: includeRelations });
  },

  async countByDateRange(
    companyId: string,
    start: Date,
    end: Date,
    client: Client = prisma,
  ): Promise<number> {
    return client.stockMovement.count({
      where: { companyId, createdAt: { gte: start, lte: end } },
    });
  },
};

export type { StockMovement };