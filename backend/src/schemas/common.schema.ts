import { z } from "zod";

export const uuidParamSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Identificador inválido" }),
  }),
});

export const coerceBoolean = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => (typeof v === "boolean" ? v : v === "true"));
