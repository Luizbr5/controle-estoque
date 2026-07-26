import type { Request, Response } from "express";
import { categoryService } from "@/services/category.service";
import { ApiError } from "@/utils/ApiError";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/api.types";

export const categoryController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const result = await categoryService.list(req.user.companyId);
    res.json({ success: true, ...result });
  },

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const category = await categoryService.getById(req.params.id, req.user.companyId);
    res.json({ success: true, data: category });
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const dto = req.body as CreateCategoryDTO;
    const category = await categoryService.create(dto, req.user.companyId);
    res.status(201).json({ success: true, data: category });
  },

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const dto = req.body as UpdateCategoryDTO;
    const category = await categoryService.update(req.params.id, dto, req.user.companyId);
    res.json({ success: true, data: category });
  },

  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    await categoryService.remove(req.params.id, req.user.companyId);
    res.json({ success: true, message: "Categoria removida com sucesso" });
  },
};