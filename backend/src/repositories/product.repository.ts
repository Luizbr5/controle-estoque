import type { Prisma, Product } from "@prisma/client";
import { prisma } from "@/config/prisma";

type Client = typeof prisma | Prisma.TransactionClient;

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export interface ProductSearchFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: "name" | "quantity" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export const productRepository = {
  /**
   * Retorna todos os produtos que casam com os filtros suportados em nível
   * de banco (busca textual, categoria, status ativo, ordenação). O filtro
   * `low_stock` (quantity <= min_quantity) compara duas colunas e é resolvido
   * na camada de serviço para evitar SQL manual, espelhando o contrato oficial.
   */
  async search(
    filters: ProductSearchFilters,
    client: Client = prisma,
  ): Promise<ProductWithCategory[]> {
    const where: Prisma.ProductWhereInput = {};

    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return client.product.findMany({
      where,
      include: { category: true },
      orderBy: { [filters.sortBy ?? "createdAt"]: filters.sortOrder ?? "desc" },
    });
  },

  /** Retorna todos os produtos (sem relações) para agregações como o dashboard. */
  async findAllRaw(client: Client = prisma): Promise<Product[]> {
    return client.product.findMany();
  },

  async findById(id: string, client: Client = prisma): Promise<ProductWithCategory | null> {
    return client.product.findUnique({ where: { id }, include: { category: true } });
  },
  
  async findByIdForUpdate(id: string, tx: Prisma.TransactionClient): Promise<Product | null> {
    const rows = await tx.$queryRaw<Product[]>`
      SELECT * FROM products WHERE id = ${id}::uuid FOR UPDATE
    `;
    return rows[0] ?? null;
  },

  async findBySku(sku: string, client: Client = prisma): Promise<Product | null> {
    return client.product.findUnique({ where: { sku } });
  },

  async create(
    data: Prisma.ProductCreateInput,
    client: Client = prisma,
  ): Promise<ProductWithCategory> {
    return client.product.create({ data, include: { category: true } });
  },

  async update(
    id: string,
    data: Prisma.ProductUpdateInput,
    client: Client = prisma,
  ): Promise<ProductWithCategory> {
    return client.product.update({ where: { id }, data, include: { category: true } });
  },

  async softDelete(id: string, client: Client = prisma): Promise<void> {
    await client.product.update({ where: { id }, data: { isActive: false } });
  },
};
