import type { Request, Response } from "express";
import { authService } from "@/services/auth.service";
import { sendSuccess } from "@/utils/apiResponse";
import { ApiError } from "@/utils/ApiError";
import type { LoginDTO, RegisterDTO } from "@/types/api.types";

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const dto = req.body as RegisterDTO;
    const result = await authService.register(dto);
    sendSuccess(res, result, 201, "Usuário registrado com sucesso");
  },

  async login(req: Request, res: Response): Promise<void> {
    const dto = req.body as LoginDTO;
    const result = await authService.login(dto);
    sendSuccess(res, result, 200, "Login realizado com sucesso");
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const user = await authService.me(req.user.id);
    sendSuccess(res, user);
  },
};
