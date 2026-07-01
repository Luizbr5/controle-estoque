import { api, USE_MOCK, mockDelay, ApiClientError, toClientError } from "./api";
import { categories, newId, timestamp } from "./mock-db";
import type {
  ApiListSuccess,
  ApiSuccess,
  ApiNoBody,
  CategoryResponseDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/api";

export const categoryService = {
  async list(): Promise<{ data: CategoryResponseDTO[]; meta: ApiListSuccess<CategoryResponseDTO>["meta"] }> {
    if (USE_MOCK) {
      return mockDelay({
        data: [...categories],
        meta: { total: categories.length, page: 1, limit: 20, totalPages: 1 },
      });
    }
    try {
      const { data } = await api.get<ApiListSuccess<CategoryResponseDTO>>("/categories");
      return { data: data.data, meta: data.meta };
    } catch (e) {
      throw toClientError(e);
    }
  },

  async getById(id: string): Promise<CategoryResponseDTO> {
    if (USE_MOCK) {
      const c = categories.find((x) => x.id === id);
      if (!c) throw new ApiClientError("NOT_FOUND", "Categoria não encontrada", 404);
      return mockDelay(c);
    }
    const { data } = await api.get<ApiSuccess<CategoryResponseDTO>>(`/categories/${id}`);
    return data.data;
  },

  async create(dto: CreateCategoryDTO): Promise<CategoryResponseDTO> {
    if (USE_MOCK) {
      if (categories.some((c) => c.name.toLowerCase() === dto.name.toLowerCase())) {
        throw new ApiClientError("DUPLICATE_ENTRY", "Já existe uma categoria com este nome", 409);
      }
      const cat: CategoryResponseDTO = {
        id: newId(),
        name: dto.name,
        description: dto.description ?? null,
        created_at: timestamp(),
        updated_at: timestamp(),
      };
      categories.push(cat);
      return mockDelay(cat);
    }
    try {
      const { data } = await api.post<ApiSuccess<CategoryResponseDTO>>("/categories", dto);
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async update(id: string, dto: UpdateCategoryDTO): Promise<CategoryResponseDTO> {
    if (USE_MOCK) {
      const idx = categories.findIndex((c) => c.id === id);
      if (idx < 0) throw new ApiClientError("NOT_FOUND", "Categoria não encontrada", 404);
      categories[idx] = {
        ...categories[idx],
        ...dto,
        description: dto.description ?? categories[idx].description,
        updated_at: timestamp(),
      };
      return mockDelay(categories[idx]);
    }
    try {
      const { data } = await api.put<ApiSuccess<CategoryResponseDTO>>(`/categories/${id}`, dto);
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      const idx = categories.findIndex((c) => c.id === id);
      if (idx < 0) throw new ApiClientError("NOT_FOUND", "Categoria não encontrada", 404);
      categories.splice(idx, 1);
      await mockDelay(null, 200);
      return;
    }
    try {
      await api.delete<ApiNoBody>(`/categories/${id}`);
    } catch (e) {
      throw toClientError(e);
    }
  },
};
