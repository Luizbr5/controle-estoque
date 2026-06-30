import { prisma } from "@/config/prisma";
import { productRepository } from "@/repositories/product.repository";
import {
  stockMovementRepository,
  type StockMovementWithRelations,
} from "@/repositories/stockMovement.repository";
import { ApiError } from "@/utils/ApiError";
import { buildMeta, normalizePagination } from "@/utils/pagination";
import type {
  ApiListSuccess,
  CreateStockMovementDTO,
  StockMovementListQuery,
  StockMovementResponseDTO,
} from "@/types/api.types";

export function toStockMovementDTO(movement: StockMovementWithRelations): StockMovementResponseDTO {
  return {
    id: movement.id,
    product_id: movement.productId,
    product: { id: movement.product.id, name: movement.product.name },
    user_id: movement.userId,
    user: movement.user ? { id: movement.user.id, name: movement.user.name } : null,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    product_quantity_after: movement.productQuantityAfter,
    created_at: movement.createdAt.toISOString(),
  };
}

function endOfDayUtc(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

function startOfDayUtc(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export const stockMovementService = {
  async list(query: StockMovementListQuery): Promise<{
    data: StockMovementResponseDTO[];
    meta: ApiListSuccess<StockMovementResponseDTO>["meta"];
  }> {
    const { page, limit, skip, take } = normalizePagination(query, 100);

    const { rows, total } = await stockMovementRepository.findManyPaginated(
      {
        productId: query.product_id,
        type: query.type,
        startDate: query.start_date ? startOfDayUtc(query.start_date) : undefined,
        endDate: query.end_date ? endOfDayUtc(query.end_date) : undefined,
      },
      { skip, take },
    );

    return { data: rows.map(toStockMovementDTO), meta: buildMeta(total, page, limit) };
  },

  async create(dto: CreateStockMovementDTO, userId: string): Promise<StockMovementResponseDTO> {
    const movement = await prisma.$transaction(async (tx) => {
      const product = await productRepository.findByIdForUpdate(dto.product_id, tx);
      if (!product || !product.isActive) {
        throw ApiError.notFound("Produto não encontrado");
      }

      let newQuantity = product.quantity;
      if (dto.type === "IN") {
        newQuantity += dto.quantity;
      } else if (dto.type === "OUT") {
        if (dto.quantity > product.quantity) {
          throw ApiError.insufficientStock(
            `Quantidade insuficiente em estoque. Disponível: ${product.quantity}, solicitado: ${dto.quantity}`,
            { available: product.quantity, requested: dto.quantity },
          );
        }
        newQuantity -= dto.quantity;
      } else {
        // ADJUSTMENT: define a quantidade absoluta em estoque.
        newQuantity = dto.quantity;
      }

      await productRepository.update(product.id, { quantity: newQuantity }, tx);

      return stockMovementRepository.create(
        {
          product: { connect: { id: product.id } },
          user: { connect: { id: userId } },
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason ?? null,
          productQuantityAfter: newQuantity,
        },
        tx,
      );
    });

    return toStockMovementDTO(movement);
  },
};
