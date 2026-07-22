import type { Request, Response } from "express";
import { stockMovementService } from "@/services/stockMovement.service";
import { ApiError } from "@/utils/ApiError";
import { parseQuery } from "@/utils/query";
import type { CreateStockMovementDTO, StockMovementListQuery } from "@/types/api.types";

export const stockMovementController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json(ApiError.unauthorized());
      return;
    }
    const query = parseQuery(req.query) as StockMovementListQuery;
    const result = await stockMovementService.list(query, req.user.companyId);
    res.json({ success: true, ...result });
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json(ApiError.unauthorized());
      return;
    }
    const dto = req.body as CreateStockMovementDTO;
    const movement = await stockMovementService.create(dto, req.user.id, req.user.companyId);
    res.status(201).json({ success: true, data: movement });
  },
};