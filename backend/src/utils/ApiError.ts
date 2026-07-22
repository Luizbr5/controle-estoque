import { ErrorCodeType } from "@/types/api.types";

/**
 * Erro de aplicação, sempre traduzido pelo middleware global de erros
 * para o envelope oficial `ApiError`: { success: false, error: { code, message, details } }.
 */
export class ApiError extends Error {
  public readonly code: ErrorCodeType | string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCodeType | string, message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static validation(message: string, details?: unknown): ApiError {
    return new ApiError("VALIDATION_ERROR", message, 400, details);
  }

  static unauthorized(message = "Não autorizado"): ApiError {
    return new ApiError("UNAUTHORIZED", message, 401);
  }

  static tokenExpired(message = "Sessão expirada, faça login novamente"): ApiError {
    return new ApiError("TOKEN_EXPIRED", message, 401);
  }

  static forbidden(message = "Acesso negado"): ApiError {
    return new ApiError("FORBIDDEN", message, 403);
  }

  static notFound(message: string): ApiError {
    return new ApiError("NOT_FOUND", message, 404);
  }

  static duplicate(message: string, details?: unknown): ApiError {
    return new ApiError("DUPLICATE_ENTRY", message, 409, details);
  }

  static insufficientStock(message: string, details?: unknown): ApiError {
    return new ApiError("INSUFFICIENT_STOCK", message, 422, details);
  }

  static internal(message = "Erro interno do servidor"): ApiError {
    return new ApiError("INTERNAL_ERROR", message, 500);
  }
}
