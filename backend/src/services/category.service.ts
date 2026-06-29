import type { Category } from "@prisma/client";
import { categoryRepository } from "@/repositories/category.repository";
import { ApiError } from "@/utils/ApiError";
import type {
  ApiListSuccess,
  CategoryResponseDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/api.types";

export function toCategoryDTO(category: Category): CategoryResponseDTO {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    created_at: category.createdAt.toISOString(),
    updated_at: category.updatedAt.toISOString(),
  };
}

export const categoryService = {
  /**
   * Lista todas as categorias. O contrato oficial não define paginação real
   * para este recurso (sempre retorna a lista completa), apenas o envelope
   * `meta` padrão — comportamento espelhado fielmente aqui.
   */
  async list(): Promise<{
    data: CategoryResponseDTO[];
    meta: ApiListSuccess<CategoryResponseDTO>["meta"];
  }> {
    const categories = await categoryRepository.findAll();
    return {
      data: categories.map(toCategoryDTO),
      meta: { total: categories.length, page: 1, limit: 20, totalPages: 1 },
    };
  },

  async getById(id: string): Promise<CategoryResponseDTO> {
    const category = await categoryRepository.findById(id);
    if (!category) throw ApiError.notFound("Categoria não encontrada");
    return toCategoryDTO(category);
  },

  async create(dto: CreateCategoryDTO): Promise<CategoryResponseDTO> {
    const duplicate = await categoryRepository.findByNameInsensitive(dto.name);
    if (duplicate) {
      throw ApiError.duplicate("Já existe uma categoria com este nome");
    }
    const created = await categoryRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    return toCategoryDTO(created);
  },

  async update(id: string, dto: UpdateCategoryDTO): Promise<CategoryResponseDTO> {
    const current = await categoryRepository.findById(id);
    if (!current) throw ApiError.notFound("Categoria não encontrada");

    const updated = await categoryRepository.update(id, {
      name: dto.name ?? current.name,
      description: dto.description ?? current.description,
    });
    return toCategoryDTO(updated);
  },

  async remove(id: string): Promise<void> {
    const current = await categoryRepository.findById(id);
    if (!current) throw ApiError.notFound("Categoria não encontrada");
    await categoryRepository.remove(id);
  },
};
