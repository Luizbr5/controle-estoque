import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types/api";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:3001/api/v1";

// Flag temporária para uso de mocks enquanto o back-end não está disponível.
// Remover quando o back-end estiver pronto: trocar para false (ou remover a checagem).
export const USE_MOCK = true;

export const TOKEN_STORAGE_KEY = "stockctl:token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const body = error.response?.data;
    if (status === 401 || body?.error?.code === "TOKEN_EXPIRED") {
      setToken(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(code: string, message: string, status = 500, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function toClientError(err: unknown): ApiClientError {
  if (err instanceof ApiClientError) return err;
  const ax = err as AxiosError<ApiError>;
  const body = ax?.response?.data;
  if (body && body.success === false) {
    return new ApiClientError(
      body.error.code,
      body.error.message,
      ax.response?.status ?? 500,
      body.error.details,
    );
  }
  return new ApiClientError(
    "INTERNAL_ERROR",
    (err as Error)?.message ?? "Erro inesperado",
    500,
  );
}

// Helper para simular latência nos mocks.
export function mockDelay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
