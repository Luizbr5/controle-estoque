import { Router } from "express";
import { productController } from "@/controllers/product.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { uploadProductImage } from "@/middlewares/upload.middleware";
import {
  createProductSchema,
  productListQuerySchema,
  updateProductSchema,
} from "@/schemas/product.schema";
import { uuidParamSchema } from "@/schemas/common.schema";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/ApiError";
import type { NextFunction, Request, Response } from "express";

export const productRouter = Router();
productRouter.use(authenticate);

function handleUpload(req: Request, res: Response, next: NextFunction): void {
  uploadProductImage(req, res, (err) => {
    if (err) {
      next(err instanceof Error ? err : ApiError.validation("Falha no upload da imagem"));
      return;
    }
    next();
  });
}

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista produtos com filtros, ordenação e paginação
 *     tags: [Products]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: category_id, schema: { type: string, format: uuid } }
 *       - { in: query, name: is_active, schema: { type: boolean, default: true } }
 *       - { in: query, name: low_stock, schema: { type: boolean } }
 *       - { in: query, name: sort_by, schema: { type: string, enum: [name, quantity, price, created_at] } }
 *       - { in: query, name: sort_order, schema: { type: string, enum: [ASC, DESC] } }
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/ProductResponseDTO' } }
 *                 meta: { $ref: '#/components/schemas/ApiMeta' }
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, quantity]
 *             properties:
 *               name: { type: string }
 *               category_id: { type: string, format: uuid, nullable: true }
 *               description: { type: string }
 *               sku: { type: string }
 *               price: { type: number }
 *               quantity: { type: integer }
 *               min_quantity: { type: integer }
 *               unit: { type: string }
 *     responses:
 *       201:
 *         description: Produto criado
 *       409:
 *         description: SKU já cadastrado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
productRouter.get("/", validate(productListQuerySchema), asyncHandler(productController.list));
productRouter.post("/", validate(createProductSchema), asyncHandler(productController.create));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     tags: [Products]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Produto encontrado }
 *       404:
 *         description: Produto não encontrado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 *   put:
 *     summary: Atualiza um produto
 *     tags: [Products]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Produto atualizado }
 *       404:
 *         description: Produto não encontrado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 *   delete:
 *     summary: Remove (inativa) um produto
 *     tags: [Products]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Produto removido }
 *       404:
 *         description: Produto não encontrado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
productRouter.get("/:id", validate(uuidParamSchema), asyncHandler(productController.getById));
productRouter.put("/:id", validate(updateProductSchema), asyncHandler(productController.update));
productRouter.delete("/:id", validate(uuidParamSchema), asyncHandler(productController.remove));

/**
 * @swagger
 * /products/{id}/image:
 *   post:
 *     summary: Faz upload da imagem de um produto
 *     tags: [Products]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200: { description: Imagem atualizada }
 *       404:
 *         description: Produto não encontrado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
productRouter.post(
  "/:id/image",
  validate(uuidParamSchema),
  handleUpload,
  asyncHandler(productController.uploadImage),
);
