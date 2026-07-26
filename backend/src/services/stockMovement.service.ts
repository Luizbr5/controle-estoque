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
  async list(
    query: StockMovementListQuery,
    companyId: string,
  ): Promise<{
    data: StockMovementResponseDTO[];
    meta: ApiListSuccess<StockMovementResponseDTO>["meta"];
  }> {
    const { page, limit, skip, take } = normalizePagination(query, 100);

    const { rows, total } = await stockMovementRepository.findManyPaginated(
      {
        companyId,
        productId: query.product_id,
        type: query.type,
        startDate: query.start_date ? startOfDayUtc(query.start_date) : undefined,
        endDate: query.end_date ? endOfDayUtc(query.end_date) : undefined,
      },
      { skip, take },
    );

    return { data: rows.map(toStockMovementDTO), meta: buildMeta(total, page, limit) };
  },

  async create(
    dto: CreateStockMovementDTO,
    userId: string,
    companyId: string,
  ): Promise<StockMovementResponseDTO> {
    const movement = await prisma.$transaction(async (tx) => {
      const product = await productRepository.findByIdForUpdate(dto.product_id, companyId, tx);
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
        newQuantity = dto.quantity;
      }

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: newQuantity },
      });

      return tx.stockMovement.create({
        data: {
          companyId,
          productId: product.id,
          userId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason ?? null,
          productQuantityAfter: newQuantity,
        },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      });
    });

    return toStockMovementDTO(movement);
  },
};