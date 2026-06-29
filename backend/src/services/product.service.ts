import { prisma } from "@/config/prisma";
import {
  productRepository,
  type ProductSearchFilters,
  type ProductWithCategory,
} from "@/repositories/product.repository";
import { stockMovementRepository } from "@/repositories/stockMovement.repository";
import { ApiError } from "@/utils/ApiError";
import { buildMeta, normalizePagination } from "@/utils/pagination";
import type {
  ApiListSuccess,
  CreateProductDTO,
  ProductListQuery,
  ProductResponseDTO,
  UpdateProductDTO,
} from "@/types/api.types";

const sortFieldMap: Record<
  NonNullable<ProductListQuery["sort_by"]>,
  ProductSearchFilters["sortBy"]
> = {
  name: "name",
  quantity: "quantity",
  price: "price",
  created_at: "createdAt",
};

export function toProductDTO(product: ProductWithCategory): ProductResponseDTO {
  return {
    id: product.id,
    category_id: product.categoryId,
    category: product.category ? { id: product.category.id, name: product.category.name } : null,
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
  async list(query: ProductListQuery): Promise<{
    data: ProductResponseDTO[];
    meta: ApiListSuccess<ProductResponseDTO>["meta"];
  }> {
    const { page, limit } = normalizePagination(query, 100);
    const isActive = query.is_active ?? true;

    // `low_stock` compara duas colunas (quantity <= min_quantity) e é resolvido
    // em memória para manter 100% da interação com o banco via Prisma Client,
    // sem SQL manual — espelhando exatamente o comportamento documentado.
    const all = await productRepository.search({
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

  async getById(id: string): Promise<ProductResponseDTO> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound("Produto não encontrado");
    return toProductDTO(product);
  },

  async create(dto: CreateProductDTO, userId: string): Promise<ProductResponseDTO> {
    if (dto.sku) {
      const existing = await productRepository.findBySku(dto.sku);
      if (existing) {
        throw ApiError.duplicate(`Já existe um produto com o SKU '${dto.sku}'`);
      }
    }

    const minQuantity = dto.min_quantity ?? 5;

    const product = await prisma.$transaction(async (tx) => {
      const created = await productRepository.create(
        {
          name: dto.name,
          description: dto.description ?? null,
          sku: dto.sku ?? null,
          price: dto.price,
          quantity: dto.quantity,
          minQuantity,
          unit: dto.unit ?? "un",
          isActive: true,
          ...(dto.category_id ? { category: { connect: { id: dto.category_id } } } : {}),
        },
        tx,
      );

      // Regra documentada: produto criado com quantidade inicial > 0 gera
      // automaticamente um movimento de entrada ("Estoque inicial").
      if (created.quantity > 0) {
        await stockMovementRepository.create(
          {
            product: { connect: { id: created.id } },
            user: { connect: { id: userId } },
            type: "IN",
            quantity: created.quantity,
            reason: "Estoque inicial",
            productQuantityAfter: created.quantity,
          },
          tx,
        );
      }

      return created;
    });

    return toProductDTO(product);
  },

  async update(id: string, dto: UpdateProductDTO): Promise<ProductResponseDTO> {
    const current = await productRepository.findById(id);
    if (!current) throw ApiError.notFound("Produto não encontrado");

    if (dto.sku && dto.sku !== current.sku) {
      const existing = await productRepository.findBySku(dto.sku);
      if (existing) {
        throw ApiError.duplicate(`Já existe um produto com o SKU '${dto.sku}'`);
      }
    }

    const updated = await productRepository.update(id, {
      name: dto.name !== undefined ? dto.name : current.name,
      description: dto.description !== undefined ? (dto.description ?? null) : current.description,
      sku: dto.sku !== undefined ? (dto.sku ?? null) : current.sku,
      price: dto.price !== undefined ? dto.price : current.price,
      quantity: dto.quantity !== undefined ? dto.quantity : current.quantity,
      minQuantity: dto.min_quantity !== undefined ? dto.min_quantity : current.minQuantity,
      unit: dto.unit !== undefined ? dto.unit : current.unit,
      ...(dto.category_id !== undefined
        ? {
            category: dto.category_id ? { connect: { id: dto.category_id } } : { disconnect: true },
          }
        : {}),
    });

    return toProductDTO(updated);
  },

  /** Exclusão lógica (soft delete): mantém histórico e movimentações associadas. */
  async remove(id: string): Promise<void> {
    const current = await productRepository.findById(id);
    if (!current) throw ApiError.notFound("Produto não encontrado");
    await productRepository.softDelete(id);
  },

  async setImage(id: string, imageUrl: string): Promise<ProductResponseDTO> {
    const current = await productRepository.findById(id);
    if (!current) throw ApiError.notFound("Produto não encontrado");
    const updated = await productRepository.update(id, { imageUrl });
    return toProductDTO(updated);
  },
};
