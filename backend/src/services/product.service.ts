import { prisma } from "@/config/prisma";
import { productRepository } from "@/repositories/product.repository";
import { ApiError } from "@/utils/ApiError";
import { buildMeta, normalizePagination } from "@/utils/pagination";
import type {
  ApiListSuccess,
  CreateProductDTO,
  ProductListQuery,
  ProductResponseDTO,
  UpdateProductDTO,
} from "@/types/api.types";

const sortFieldMap: Record<string, "name" | "quantity" | "price" | "createdAt"> = {
  name: "name",
  quantity: "quantity",
  price: "price",
  created_at: "createdAt",
};

export function toProductDTO(product: any): ProductResponseDTO {
  return {
    id: product.id,
    category_id: product.categoryId,
    category: product.category
      ? { id: product.category.id, name: product.category.name }
      : null,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: Number(product.price),
    quantity: product.quantity,
    min_quantity: product.minQuantity,
    unit: product.unit,
    is_active: product.isActive,
    low_stock: product.quantity <= product.minQuantity,
    image_url: product.imageUrl,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
  };
}

export const productService = {
  async list(query: ProductListQuery, companyId: string): Promise<{
    data: ProductResponseDTO[];
    meta: ApiListSuccess<ProductResponseDTO>["meta"];
  }> {
    const { page, limit } = normalizePagination(query, 100);
    const isActive = query.is_active ?? true;

    const all = await productRepository.search({
      companyId,
      search: query.search,
      categoryId: query.category_id,
      isActive,
      sortBy: sortFieldMap[query.sort_by ?? "created_at"],
      sortOrder: (query.sort_order ?? "DESC").toLowerCase() as "asc" | "desc",
    });

    const filtered = query.low_stock ? all.filter((p) => p.quantity <= p.minQuantity) : all;

    const total = filtered.length;
    const paged = filtered.slice((page - 1) * limit, page * limit);

    return { data: paged.map(toProductDTO), meta: buildMeta(total, page, limit) };
  },

  async getById(id: string, companyId: string): Promise<ProductResponseDTO> {
    const product = await productRepository.findById(id, companyId);
    if (!product) throw ApiError.notFound("Produto não encontrado");
    return toProductDTO(product);
  },

  async create(dto: CreateProductDTO, userId: string, companyId: string): Promise<ProductResponseDTO> {
    const minQuantity = dto.min_quantity ?? 5;

    const product = await prisma.$transaction(async (tx) => {
      if (dto.sku) {
        const existing = await productRepository.findBySku(dto.sku, companyId, tx);
        if (existing) {
          throw ApiError.duplicate(`Já existe um produto com o SKU '${dto.sku}'`);
        }
      }

      if (dto.category_id) {
        const category = await tx.category.findFirst({
          where: { id: dto.category_id, companyId },
        });
        if (!category) {
          throw ApiError.notFound("Categoria não encontrada");
        }
      }

      const created = await tx.product.create({
        data: {
          companyId,
          name: dto.name,
          description: dto.description ?? null,
          sku: dto.sku ?? null,
          price: dto.price,
          quantity: dto.quantity,
          minQuantity,
          unit: dto.unit ?? "un",
          isActive: true,
          ...(dto.category_id && { categoryId: dto.category_id }),
        },
        include: { category: true },
      });

      if (created.quantity > 0) {
        await tx.stockMovement.create({
          data: {
            companyId,
            productId: created.id,
            userId,
            type: "IN",
            quantity: created.quantity,
            reason: "Estoque inicial",
            productQuantityAfter: created.quantity,
          },
        });
      }

      return created;
    });

    return toProductDTO(product);
  },

  async update(
    id: string,
    dto: UpdateProductDTO,
    companyId: string,
  ): Promise<ProductResponseDTO> {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await productRepository.findById(id, companyId, tx);
      if (!current) throw ApiError.notFound("Produto não encontrado");

      if (dto.sku && dto.sku !== current.sku) {
        const existing = await productRepository.findBySku(dto.sku, companyId, tx);
        if (existing) {
          throw ApiError.duplicate(`Já existe um produto com o SKU '${dto.sku}'`);
        }
      }

      if (dto.category_id !== undefined && dto.category_id) {
        const category = await tx.category.findFirst({
          where: { id: dto.category_id, companyId },
        });
        if (!category) {
          throw ApiError.notFound("Categoria não encontrada");
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          name: dto.name ?? current.name,
          description: dto.description !== undefined ? dto.description : current.description,
          sku: dto.sku !== undefined ? dto.sku : current.sku,
          price: dto.price ?? current.price,
          minQuantity: dto.min_quantity ?? current.minQuantity,
          unit: dto.unit ?? current.unit,
          ...(dto.category_id !== undefined && { categoryId: dto.category_id }),
        },
        include: { category: true },
      });
    });

    return toProductDTO(updated);
  },

  async remove(id: string, companyId: string): Promise<void> {
    const current = await productRepository.findById(id, companyId);
    if (!current) throw ApiError.notFound("Produto não encontrado");
    await productRepository.softDelete(id);
  },

  async setImage(id: string, imageUrl: string, companyId: string): Promise<ProductResponseDTO> {
    const current = await productRepository.findById(id, companyId);
    if (!current) throw ApiError.notFound("Produto não encontrado");
    const updated = await productRepository.update(id, { imageUrl });
    return toProductDTO(updated);
  },
};