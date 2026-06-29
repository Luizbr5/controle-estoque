import { Router } from "express";
import { stockMovementController } from "@/controllers/stockMovement.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  createStockMovementSchema,
  stockMovementListQuerySchema,
} from "@/schemas/stockMovement.schema";
import { asyncHandler } from "@/utils/asyncHandler";

export const stockMovementRouter = Router();
stockMovementRouter.use(authenticate);

/**
 * @swagger
 * /stock-movements:
 *   get:
 *     summary: Lista movimentações de estoque com filtros e paginação
 *     tags: [Stock Movements]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: product_id, schema: { type: string, format: uuid } }
 *       - { in: query, name: type, schema: { type: string, enum: [IN, OUT, ADJUSTMENT] } }
 *       - { in: query, name: start_date, schema: { type: string, example: "2024-02-01" } }
 *       - { in: query, name: end_date, schema: { type: string, example: "2024-02-28" } }
 *     responses:
 *       200:
 *         description: Lista de movimentações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/StockMovementResponseDTO' } }
 *                 meta: { $ref: '#/components/schemas/ApiMeta' }
 *   post:
 *     summary: Registra uma movimentação de estoque (entrada, saída ou ajuste)
 *     tags: [Stock Movements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, type, quantity]
 *             properties:
 *               product_id: { type: string, format: uuid }
 *               type: { type: string, enum: [IN, OUT, ADJUSTMENT] }
 *               quantity: { type: integer, minimum: 0 }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Movimentação registrada
 *       404:
 *         description: Produto não encontrado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 *       422:
 *         description: Quantidade insuficiente em estoque
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
stockMovementRouter.get(
  "/",
  validate(stockMovementListQuerySchema),
  asyncHandler(stockMovementController.list),
);
stockMovementRouter.post(
  "/",
  validate(createStockMovementSchema),
  asyncHandler(stockMovementController.create),
);
