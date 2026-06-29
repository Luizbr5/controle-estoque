import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "@/utils/ApiError";

/**
 * Valida req.{body,query,params} contra um schema Zod combinado e
 * substitui os objetos originais pelos valores já normalizados
 * (coerções de tipo, trims, defaults) antes de chegar ao controller.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown; query?: unknown; params?: unknown };

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as typeof req.query;
      if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.slice(1).join("."),
          message: e.message,
        }));
        next(ApiError.validation("Dados inválidos na requisição", details));
        return;
      }
      next(err);
    }
  };
}
