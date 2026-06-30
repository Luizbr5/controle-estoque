import { z } from "zod";

const priceSchema = z.coerce.number().positive("Preço deve ser maior que zero");
const quantitySchema = z.coerce.number().int().nonnegative("Quantidade não pode ser negativa");
const minQuantitySchema = z.coerce
  .number()
  .int()
  .nonnegative("Quantidade mínima não pode ser negativa");

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(150),
    category_id: z.string().uuid().nullable().optional(),
    description: z.string().trim().max(1000).optional(),
    sku: z.string().trim().min(1).max(60).optional(),
    price: priceSchema,
    quantity: quantitySchema,
    min_quantity: minQuantitySchema.optional(),
    unit: z.string().trim().min(1).max(20).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid({ message: "Identificador inválido" }) }),
  body: z
    .object({
      name: z.string().trim().min(2).max(150).optional(),
      category_id: z.string().uuid().nullable().optional(),
      description: z.string().trim().max(1000).optional(),
      sku: z.string().trim().min(1).max(60).optional(),
      price: priceSchema.optional(),
      min_quantity: minQuantitySchema.optional(),
      unit: z.string().trim().min(1).max(20).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe ao menos um campo para atualizar",
    }),
});

export const productListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    search: z.string().trim().min(1).optional(),
    category_id: z.string().uuid().optional(),
    is_active: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((v) => (typeof v === "boolean" ? v : v === "true"))
      .optional(),
    low_stock: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((v) => (typeof v === "boolean" ? v : v === "true"))
      .optional(),
    sort_by: z.enum(["name", "quantity", "price", "created_at"]).optional(),
    sort_order: z.enum(["ASC", "DESC"]).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type ProductListQueryInput = z.infer<typeof productListQuerySchema>["query"];
