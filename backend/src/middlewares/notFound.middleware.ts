import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/utils/ApiError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}
