import { z } from "zod";

export const programCreateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  type: z.string().default("points"),
  rules: z
    .object({
      pointsPerEuro: z.number().positive("Pontos por EUR deve ser positivo").default(1),
      tiers: z
        .array(
          z.object({
            name: z.string().min(1),
            minPoints: z.number().int().min(0),
          })
        )
        .optional()
        .default([]),
    })
    .default({ pointsPerEuro: 1, tiers: [] }),
});

export const programUpdateSchema = programCreateSchema.partial().extend({
  active: z.boolean().optional(),
});

export const transactionSchema = z.object({
  customerId: z.coerce.number().positive("Cliente obrigatorio"),
  points: z.coerce.number().int().positive("Pontos deve ser positivo"),
  type: z.enum(["earn", "redeem"]),
  description: z.string().max(500).optional().default(""),
});

export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
