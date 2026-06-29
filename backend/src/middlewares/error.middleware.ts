import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { ApiError } from "@/utils/ApiError";
import { logger } from "@/config/logger";
import { isProduction } from "@/config/env";
import type { ApiError as ApiErrorBody } from "@/types/api.types";

function fromPrismaError(err: Prisma.PrismaClientKnownRequestError): ApiError {
  switch (err.code) {
    case "P2002": {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta!.target as string[]).join(", ")
        : "campo";
      return ApiError.duplicate(`Já existe um registro com este(s) valor(es): ${target}`);
    }
    case "P2025":
      return ApiError.notFound("Registro não encontrado");
    case "P2003":
      return ApiError.validation("Referência inválida: o registro relacionado não existe");
    default:
      return ApiError.internal("Erro ao acessar o banco de dados");
  }
}

/**
 * Middleware global de tratamento de erros. Sempre o último middleware
 * registrado em app.ts. Traduz qualquer erro lançado na aplicação para o
 * envelope oficial `{ success: false, error: { code, message, details } }`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = fromPrismaError(err);
  } else if (err instanceof multer.MulterError) {
    apiError = ApiError.validation(`Falha no upload do arquivo: ${err.message}`);
  } else if (err instanceof Error && err.name === "JsonWebTokenError") {
    apiError = ApiError.unauthorized("Token de autenticação inválido");
  } else {
    apiError = ApiError.internal();
  }

  if (apiError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${apiError.message}`, {
      stack: err instanceof Error ? err.stack : undefined,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> [${apiError.code}] ${apiError.message}`);
  }

  const body: ApiErrorBody = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details !== undefined ? { details: apiError.details } : {}),
      ...(!isProduction && apiError.statusCode >= 500 && err instanceof Error
        ? { details: apiError.details ?? err.stack }
        : {}),
    },
  };

  res.status(apiError.statusCode).json(body);
}
