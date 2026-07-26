import { describe, it, expect } from "vitest";
import { ApiError } from "@/utils/ApiError";

describe("ApiError", () => {
  it("deve criar erro", () => {
    const error = ApiError.notFound("Produto não encontrado");
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Produto não encontrado");
  });

  it("deve ter statusCode", () => {
    const error = ApiError.notFound("Teste");
    expect(error.statusCode).toBeDefined();
  });

  it("deve ser throwable", () => {
    expect(() => {
      throw ApiError.notFound("Erro");
    }).toThrow();
  });
});
