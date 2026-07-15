import { prisma } from "@/config/prisma";
import { productRepository } from "@/repositories/product.repository";
import { ApiError } from "@/utils/ApiError";
import { buildMeta, normalizePagination } from "@/utils/pagination";
import { cache } from "@/config/cache";
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

// Tipos para cache
type ProductListResult = {
  data: ProductResponseDTO[];
  meta: ApiListSuccess<ProductResponseDTO>["meta"];
};

// Função auxiliar para gerar chave de cache
function getCacheKey(companyId: string, query?: any): string {
  return `products:${companyId}:${JSON.stringify(query || {})}`;
}

export const productService = {
  async list(query: ProductListQuery, companyId: string): Promise<ProductListResult> {
    // Tentar pegar do cache
    const cacheKey = getCacheKey(companyId, query);
    const cached = cache.get<ProductListResult>(cacheKey);
    if (cached) {
      return cached;
    }

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

    const result: ProductListResult = { 
      data: paged.map(toProductDTO), 
      meta: buildMeta(total, page, limit) 
    };

    // Guardar no cache por 5 minutos
    cache.set<ProductListResult>(cacheKey, result, 300);

    return result;
  },

  async getById(id: string, companyId: string): Promise<ProductResponseDTO> {
    // Tentar pegar do cache
    const cacheKey = `product:${companyId}:${id}`;
    const cached = cache.get<ProductResponseDTO>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await productRepository.findById(id, companyId);
    if (!product) throw ApiError.notFound("Produto não encontrado");
    
    const result = toProductDTO(product);
    
    // Guardar no cache por 5 minutos
    cache.set<ProductResponseDTO>(cacheKey, result, 300);
    
    return result;
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

    // Limpar cache quando criar novo produto
    cache.delete(`products:${companyId}:*`);

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

    // Limpar cache quando atualizar
    cache.delete(`products:${companyId}:*`);
    cache.delete(`product:${companyId}:${id}`);

    return toProductDTO(updated);
  },

  async remove(id: string, companyId: string): Promise<void> {
    const current = await productRepository.findById(id, companyId);
    if (!current) throw ApiError.notFound("Produto não encontrado");
    await productRepository.softDelete(id);

    // Limpar cache quando deletar
    cache.delete(`products:${companyId}:*`);
    cache.delete(`product:${companyId}:${id}`);
  },

  async setImage(id: string, imageUrl: string, companyId: string): Promise<ProductResponseDTO> {
    const current = await productRepository.findById(id, companyId);
    if (!current) throw ApiError.notFound("Produto não encontrado");
    const updated = await productRepository.update(id, { imageUrl });

    // Limpar cache quando atualizar imagem
    cache.delete(`product:${companyId}:${id}`);
    cache.delete(`products:${companyId}:*`);

    return toProductDTO(updated);
  },
};