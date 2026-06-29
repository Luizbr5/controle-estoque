import { Router } from "express";
import { categoryController } from "@/controllers/category.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "@/schemas/category.schema";
import { uuidParamSchema } from "@/schemas/common.schema";
import { asyncHandler } from "@/utils/asyncHandler";

export const categoryRouter = Router();
categoryRouter.use(authenticate);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/CategoryResponseDTO' } }
 *                 meta: { $ref: '#/components/schemas/ApiMeta' }
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Eletrônicos" }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Categoria criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/CategoryResponseDTO' }
 *       409:
 *         description: Categoria com este nome já existe
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
categoryRouter.get("/", asyncHandler(categoryController.list));
categoryRouter.post("/", validate(createCategorySchema), asyncHandler(categoryController.create));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *       404:
 *         description: Categoria não encontrada
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 *   put:
 *     summary: Atualiza uma categoria
 *     tags: [Categories]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 *   delete:
 *     summary: Remove uma categoria
 *     tags: [Categories]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Categoria removida
 *       404:
 *         description: Categoria não encontrada
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
categoryRouter.get("/:id", validate(uuidParamSchema), asyncHandler(categoryController.getById));
categoryRouter.put("/:id", validate(updateCategorySchema), asyncHandler(categoryController.update));
categoryRouter.delete("/:id", validate(uuidParamSchema), asyncHandler(categoryController.remove));
