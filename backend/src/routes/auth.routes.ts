import { Router } from "express";
import { authController } from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import { asyncHandler } from "@/utils/asyncHandler";

export const authRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Maria Silva" }
 *               email: { type: string, format: email, example: "maria@empresa.com" }
 *               password: { type: string, format: password, minLength: 6 }
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { $ref: '#/components/schemas/AuthPayload' } }
 *       409:
 *         description: E-mail já cadastrado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
authRouter.post("/register", validate(registerSchema), asyncHandler(authController.register));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { $ref: '#/components/schemas/AuthPayload' } }
 *       401:
 *         description: E-mail ou senha inválidos
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true } }
 *                 - type: object
 *                   properties: { data: { $ref: '#/components/schemas/UserResponseDTO' } }
 *       401:
 *         description: Não autenticado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } }
 */
authRouter.get("/me", authenticate, asyncHandler(authController.me));
