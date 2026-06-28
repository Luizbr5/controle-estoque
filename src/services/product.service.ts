import { api, USE_MOCK, mockDelay, ApiClientError, toClientError } from "./api";
import { categories, products, stockMovements, newId, timestamp, mockUser } from "./mock-db";
import type {
  ApiListSuccess,
  ApiSuccess,
  ApiNoBody,
  CreateProductDTO,
  ProductListQuery,
  ProductResponseDTO,
  UpdateProductDTO,
} from "@/types/api";

function computeLowStock(p: ProductResponseDTO): ProductResponseDTO {
  return { ...p, low_stock: p.quantity <= p.min_quantity };
}

export const productService = {
  async list(query: ProductListQuery = {}): Promise<{
    data: ProductResponseDTO[];
    meta: ApiListSuccess<ProductResponseDTO>["meta"];
  }> {
    if (USE_MOCK) {
      const page = query.page ?? 1;
      const limit = Math.min(query.limit ?? 20, 100);
      const isActive = query.is_active ?? true;
      let list = products.filter((p) => p.is_active === isActive);

      if (query.search) {
        const s = query.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            (p.sku ?? "").toLowerCase().includes(s),
        );
      }
      if (query.category_id) list = list.filter((p) => p.category_id === query.category_id);
      if (query.low_stock) list = list.filter((p) => p.quantity <= p.min_quantity);

      const sortBy = query.sort_by ?? "created_at";
      const order = (query.sort_order ?? "DESC") === "ASC" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const av = (a as any)[sortBy];
        const bv = (b as any)[sortBy];
        if (av < bv) return -1 * order;
        if (av > bv) return 1 * order;
        return 0;
      });

      const total = list.length;
      const paged = list.slice((page - 1) * limit, page * limit).map(computeLowStock);
      return mockDelay({
        data: paged,
        meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
    }
    try {
      const { data } = await api.get<ApiListSuccess<ProductResponseDTO>>("/products", {
        params: query,
      });
      return { data: data.data, meta: data.meta };
    } catch (e) {
      throw toClientError(e);
    }
  },

  async getById(id: string): Promise<ProductResponseDTO> {
    if (USE_MOCK) {
      const p = products.find((x) => x.id === id);
      if (!p) throw new ApiClientError("NOT_FOUND", "Produto não encontrado", 404);
      return mockDelay(computeLowStock(p));
    }
    try {
      const { data } = await api.get<ApiSuccess<ProductResponseDTO>>(`/products/${id}`);
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async create(dto: CreateProductDTO): Promise<ProductResponseDTO> {
    if (USE_MOCK) {
      if (dto.sku && products.some((p) => p.sku === dto.sku)) {
        throw new ApiClientError(
          "DUPLICATE_ENTRY",
          `Já existe um produto com o SKU '${dto.sku}'`,
          409,
        );
      }
      const cat = dto.category_id ? categories.find((c) => c.id === dto.category_id) : null;
      const product: ProductResponseDTO = {
        id: newId(),
        category_id: dto.category_id ?? null,
        category: cat ? { id: cat.id, name: cat.name } : null,
        name: dto.name,
        description: dto.description ?? null,
        sku: dto.sku ?? null,
        price: dto.price,
        quantity: dto.quantity,
        min_quantity: dto.min_quantity ?? 5,
        unit: dto.unit ?? "un",
        is_active: true,
        low_stock: dto.quantity <= (dto.min_quantity ?? 5),
        image_url: null,
        created_at: timestamp(),
        updated_at: timestamp(),
      };
      products.unshift(product);
      if (product.quantity > 0) {
        stockMovements.unshift({
          id: newId(),
          product_id: product.id,
          product: { id: product.id, name: product.name },
          user_id: mockUser.id,
          user: { id: mockUser.id, name: mockUser.name },
          type: "IN",
          quantity: product.quantity,
          reason: "Estoque inicial",
          product_quantity_after: product.quantity,
          created_at: timestamp(),
        });
      }
      return mockDelay(product);
    }
    try {
      const { data } = await api.post<ApiSuccess<ProductResponseDTO>>("/products", dto);
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async update(id: string, dto: UpdateProductDTO): Promise<ProductResponseDTO> {
    if (USE_MOCK) {
      const idx = products.findIndex((p) => p.id === id);
      if (idx < 0) throw new ApiClientError("NOT_FOUND", "Produto não encontrado", 404);
      const current = products[idx];
      if (dto.sku && dto.sku !== current.sku && products.some((p) => p.sku === dto.sku)) {
        throw new ApiClientError(
          "DUPLICATE_ENTRY",
          `Já existe um produto com o SKU '${dto.sku}'`,
          409,
        );
      }
      const cat =
        dto.category_id !== undefined
          ? dto.category_id
            ? categories.find((c) => c.id === dto.category_id) ?? null
            : null
          : current.category && categories.find((c) => c.id === current.category_id) || null;
      const merged: ProductResponseDTO = {
        ...current,
        ...dto,
        category_id: dto.category_id !== undefined ? dto.category_id ?? null : current.category_id,
        category: cat ? { id: cat.id, name: cat.name } : null,
        description: dto.description !== undefined ? dto.description ?? null : current.description,
        sku: dto.sku !== undefined ? dto.sku ?? null : current.sku,
        updated_at: timestamp(),
      };
      products[idx] = computeLowStock(merged);
      return mockDelay(products[idx]);
    }
    try {
      const { data } = await api.put<ApiSuccess<ProductResponseDTO>>(`/products/${id}`, dto);
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      const idx = products.findIndex((p) => p.id === id);
      if (idx < 0) throw new ApiClientError("NOT_FOUND", "Produto não encontrado", 404);
      products[idx] = { ...products[idx], is_active: false, updated_at: timestamp() };
      await mockDelay(null, 200);
      return;
    }
    try {
      await api.delete<ApiNoBody>(`/products/${id}`);
    } catch (e) {
      throw toClientError(e);
    }
  },

  async uploadImage(id: string, file: File): Promise<ProductResponseDTO> {
    if (USE_MOCK) {
      const idx = products.findIndex((p) => p.id === id);
      if (idx < 0) throw new ApiClientError("NOT_FOUND", "Produto não encontrado", 404);
      const url = URL.createObjectURL(file);
      products[idx] = { ...products[idx], image_url: url, updated_at: timestamp() };
      return mockDelay(products[idx]);
    }
    const form = new FormData();
    form.append("image", file);
    try {
      const { data } = await api.post<ApiSuccess<ProductResponseDTO>>(
        `/products/${id}/image`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },
};
