import type { Response } from "express";
import type { ApiListSuccess, ApiMeta, ApiNoBody, ApiSuccess } from "@/types/api.types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
): Response {
  const body: ApiSuccess<T> = { success: true, data, ...(message ? { message } : {}) };
  return res.status(statusCode).json(body);
}

export function sendListSuccess<T>(
  res: Response,
  data: T[],
  meta: ApiMeta,
  statusCode = 200,
  message?: string,
): Response {
  const body: ApiListSuccess<T> = { success: true, data, meta, ...(message ? { message } : {}) };
  return res.status(statusCode).json(body);
}

export function sendNoBody(res: Response, message: string, statusCode = 200): Response {
  const body: ApiNoBody = { success: true, message };
  return res.status(statusCode).json(body);
}
