import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { ApiError } from "@/utils/ApiError";
import type { AuthenticatedUser } from "@/types/express";

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Middleware de autenticação JWT. Protege as rotas privadas da API.
 * Em caso de token ausente/invalido retorna UNAUTHORIZED (401);
 * em caso de token expirado retorna especificamente TOKEN_EXPIRED (401),
 * conforme tratado pelo interceptor do front-end.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(ApiError.unauthorized("Token de autenticação não informado"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & JwtPayload;
    const user: AuthenticatedUser = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
    };
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(ApiError.tokenExpired());
      return;
    }
    next(ApiError.unauthorized("Token de autenticação inválido"));
  }
}
