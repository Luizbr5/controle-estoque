import { z } from "zod";

export const createStockMovementSchema = z.object({
  body: z.object({
    product_id: z.string().uuid({ message: "product_id inválido" }),
    type: z.enum(["IN", "OUT", "ADJUSTMENT"], {
      errorMap: () => ({ message: "type deve ser IN, OUT ou ADJUSTMENT" }),
    }),
    quantity: z.coerce.number().int().nonnegative("Quantidade não pode ser negativa"),
    reason: z.string().trim().max(500).optional(),
  }),
});

export const stockMovementListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    product_id: z.string().uuid().optional(),
    type: z.enum(["IN", "OUT", "ADJUSTMENT"]).optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date deve estar no formato YYYY-MM-DD")
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date deve estar no formato YYYY-MM-DD")
      .optional(),
  }),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>["body"];
export type StockMovementListQueryInput = z.infer<typeof stockMovementListQuerySchema>["query"];
