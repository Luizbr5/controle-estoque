import type { Request, Response } from "express";
import { dashboardService } from "@/services/dashboard.service";
import { ApiError } from "@/utils/ApiError";

export const dashboardController = {
  async summary(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json(ApiError.unauthorized());
      return;
    }
    const summary = await dashboardService.summary(req.user.companyId);
    res.json({ success: true, data: summary });
  },

  async lowStock(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json(ApiError.unauthorized());
      return;
    }
    const result = await dashboardService.lowStock(req.user.companyId);
    res.json({ success: true, ...result });
  },

  async recentMovements(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json(ApiError.unauthorized());
      return;
    }
    const result = await dashboardService.recentMovements(req.user.companyId);
    res.json({ success: true, ...result });
  },
};