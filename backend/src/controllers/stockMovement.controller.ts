import type { Request, Response } from "express";
import { stockMovementService } from "@/services/stockMovement.service";
import { sendListSuccess, sendSuccess } from "@/utils/apiResponse";
import { ApiError } from "@/utils/ApiError";
import type { CreateStockMovementDTO, StockMovementListQuery } from "@/types/api.types";

export const stockMovementController = {
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as StockMovementListQuery;
    const { data, meta } = await stockMovementService.list(query);
    sendListSuccess(res, data, meta);
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const dto = req.body as CreateStockMovementDTO;
    const movement = await stockMovementService.create(dto, req.user.id);
    sendSuccess(res, movement, 201, "Movimentação registrada com sucesso");
  },
};
