import type { Request, Response } from "express";
import { dashboardService } from "@/services/dashboard.service";
import { sendListSuccess, sendSuccess } from "@/utils/apiResponse";

export const dashboardController = {
  async summary(_req: Request, res: Response): Promise<void> {
    const summary = await dashboardService.summary();
    sendSuccess(res, summary);
  },

  async lowStock(_req: Request, res: Response): Promise<void> {
    const { data, meta } = await dashboardService.lowStock();
    sendListSuccess(res, data, meta);
  },

  async recentMovements(_req: Request, res: Response): Promise<void> {
    const { data, meta } = await dashboardService.recentMovements();
    sendListSuccess(res, data, meta);
  },
};
