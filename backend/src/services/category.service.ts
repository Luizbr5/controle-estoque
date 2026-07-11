import type { Category } from "@prisma/client";
import { prisma } from "@/config/prisma";
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
  async list(companyId: string): Promise<{
    data: CategoryResponseDTO[];
    meta: ApiListSuccess<CategoryResponseDTO>["meta"];
  }> {
    const categories = await categoryRepository.findAll(companyId);
    return {
      data: categories.map(toCategoryDTO),
      meta: { total: categories.length, page: 1, limit: 20, totalPages: 1 },
    };
  },

  async getById(id: string, companyId: string): Promise<CategoryResponseDTO> {
    const category = await categoryRepository.findById(id, companyId);
    if (!category) throw ApiError.notFound("Categoria não encontrada");
    return toCategoryDTO(category);
  },

  async create(dto: CreateCategoryDTO, companyId: string): Promise<CategoryResponseDTO> {
    const created = await prisma.$transaction(async (tx) => {
      const duplicate = await categoryRepository.findByNameInsensitive(dto.name, companyId, tx);
      if (duplicate) {
        throw ApiError.duplicate("Já existe uma categoria com este nome nessa empresa");
      }
      return categoryRepository.create(
        {
          companyId,
          name: dto.name,
          description: dto.description ?? null,
        },
        tx,
      );
    });
    return toCategoryDTO(created);
  },

  async update(
    id: string,
    dto: UpdateCategoryDTO,
    companyId: string,
  ): Promise<CategoryResponseDTO> {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await categoryRepository.findById(id, companyId, tx);
      if (!current) throw ApiError.notFound("Categoria não encontrada");

      if (dto.name && dto.name.toLowerCase() !== current.name.toLowerCase()) {
        const duplicate = await categoryRepository.findByNameInsensitive(dto.name, companyId, tx);
        if (duplicate) {
          throw ApiError.duplicate("Já existe uma categoria com este nome nessa empresa");
        }
      }

      return categoryRepository.update(
        id,
        {
          name: dto.name ?? current.name,
          description: dto.description !== undefined ? dto.description : current.description,
        },
        tx,
      );
    });
    return toCategoryDTO(updated);
  },

  async remove(id: string, companyId: string): Promise<void> {
    const current = await categoryRepository.findById(id, companyId);
    if (!current) throw ApiError.notFound("Categoria não encontrada");
    await categoryRepository.remove(id);
  },
};