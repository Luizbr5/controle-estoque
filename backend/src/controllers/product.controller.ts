import type { Request, Response } from "express";
import { productService } from "@/services/product.service";
import { buildImageUrl } from "@/middlewares/upload.middleware";
import { sendListSuccess, sendNoBody, sendSuccess } from "@/utils/apiResponse";
import { ApiError } from "@/utils/ApiError";
import type { CreateProductDTO, ProductListQuery, UpdateProductDTO } from "@/types/api.types";

export const productController = {
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ProductListQuery;
    const { data, meta } = await productService.list(query);
    sendListSuccess(res, data, meta);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const product = await productService.getById(req.params.id);
    sendSuccess(res, product);
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const dto = req.body as CreateProductDTO;
    const product = await productService.create(dto, req.user.id);
    sendSuccess(res, product, 201, "Produto criado com sucesso");
  },

  async update(req: Request, res: Response): Promise<void> {
    const dto = req.body as UpdateProductDTO;
    const product = await productService.update(req.params.id, dto);
    sendSuccess(res, product, 200, "Produto atualizado com sucesso");
  },

  async remove(req: Request, res: Response): Promise<void> {
    await productService.remove(req.params.id);
    sendNoBody(res, "Produto removido com sucesso");
  },

  async uploadImage(req: Request, res: Response): Promise<void> {
    if (!req.file) throw ApiError.validation("Nenhum arquivo de imagem foi enviado");
    const imageUrl = buildImageUrl(req.file.filename);
    const product = await productService.setImage(req.params.id, imageUrl);
    sendSuccess(res, product, 200, "Imagem do produto atualizada com sucesso");
  },
};
