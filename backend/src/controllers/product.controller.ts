import type { Request, Response } from "express";
import { productService } from "@/services/product.service";
import { ApiError } from "@/utils/ApiError";
import { parseQuery } from "@/utils/query";
import type { CreateProductDTO, ProductListQuery, UpdateProductDTO } from "@/types/api.types";

export const productController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const query = parseQuery(req.query) as ProductListQuery;
    const result = await productService.list(query, req.user.companyId);
    res.json({ success: true, ...result });
  },

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const product = await productService.getById(req.params.id, req.user.companyId);
    res.json({ success: true, data: product });
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const dto = req.body as CreateProductDTO;
    const product = await productService.create(dto, req.user.id, req.user.companyId);
    res.status(201).json({ success: true, data: product });
  },

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const dto = req.body as UpdateProductDTO;
    const product = await productService.update(req.params.id, dto, req.user.companyId);
    res.json({ success: true, data: product });
  },

  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    await productService.remove(req.params.id, req.user.companyId);
    res.json({ success: true, message: "Produto removido com sucesso" });
  },

  async setImage(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const { imageUrl } = req.body as { imageUrl?: string };
    if (!imageUrl || typeof imageUrl !== "string") {
      throw ApiError.notFound("imageUrl é obrigatório");
    }
    const product = await productService.setImage(req.params.id, imageUrl, req.user.companyId);
    res.json({ success: true, data: product });
  },
};