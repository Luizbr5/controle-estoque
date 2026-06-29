import type { Request, Response } from "express";
import { categoryService } from "@/services/category.service";
import { sendListSuccess, sendNoBody, sendSuccess } from "@/utils/apiResponse";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/api.types";

export const categoryController = {
  async list(_req: Request, res: Response): Promise<void> {
    const { data, meta } = await categoryService.list();
    sendListSuccess(res, data, meta);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const category = await categoryService.getById(req.params.id);
    sendSuccess(res, category);
  },

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCategoryDTO;
    const category = await categoryService.create(dto);
    sendSuccess(res, category, 201, "Categoria criada com sucesso");
  },

  async update(req: Request, res: Response): Promise<void> {
    const dto = req.body as UpdateCategoryDTO;
    const category = await categoryService.update(req.params.id, dto);
    sendSuccess(res, category, 200, "Categoria atualizada com sucesso");
  },

  async remove(req: Request, res: Response): Promise<void> {
    await categoryService.remove(req.params.id);
    sendNoBody(res, "Categoria removida com sucesso");
  },
};
