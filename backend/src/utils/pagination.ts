import type { ApiMeta } from "@/types/api.types";

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

/**
 * Normaliza page/limit vindos da query string.
 * `maxLimit` evita varreduras custosas (espelha o cap de 100 usado no
 * contrato de Produtos: `Math.min(query.limit ?? 20, 100)`).
 */
export function normalizePagination(input: PaginationInput, maxLimit = 100): NormalizedPagination {
  const page = input.page && input.page > 0 ? Math.floor(input.page) : 1;
  const limit = input.limit && input.limit > 0 ? Math.min(Math.floor(input.limit), maxLimit) : 20;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildMeta(total: number, page: number, limit: number): ApiMeta {
  return { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
