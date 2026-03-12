import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Telefone inválido").max(50),
  notes: z.string().max(1000).optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

export const customerUpdateSchema = customerSchema.extend({
  id: z.coerce.number().positive(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
