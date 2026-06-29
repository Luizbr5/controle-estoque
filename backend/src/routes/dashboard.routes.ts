import { Router } from "express";
import { dashboardController } from "@/controllers/dashboard.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Retorna o resumo geral do estoque
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Resumo do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/DashboardSummaryResponseDTO' }
 */
dashboardRouter.get("/summary", asyncHandler(dashboardController.summary));

/**
 * @swagger
 * /dashboard/low-stock:
 *   get:
 *     summary: Lista produtos ativos com estoque baixo
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Produtos com estoque baixo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/ProductResponseDTO' } }
 *                 meta: { $ref: '#/components/schemas/ApiMeta' }
 */
dashboardRouter.get("/low-stock", asyncHandler(dashboardController.lowStock));

/**
 * @swagger
 * /dashboard/recent-movements:
 *   get:
 *     summary: Lista as 10 movimentações de estoque mais recentes
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Movimentações recentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/StockMovementResponseDTO' } }
 *                 meta: { $ref: '#/components/schemas/ApiMeta' }
 */
dashboardRouter.get("/recent-movements", asyncHandler(dashboardController.recentMovements));
