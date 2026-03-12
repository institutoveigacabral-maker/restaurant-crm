import { z } from "zod";

export const menuCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().default(""),
});

export const menuCategoryUpdateSchema = menuCategorySchema.extend({
  id: z.coerce.number().positive(),
});

export const menuItemSchema = z.object({
  categoryId: z.coerce.number().positive("Categoria é obrigatória"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().default(""),
  price: z.coerce.number().positive("Preço deve ser maior que 0"),
  available: z.boolean().optional().default(true),
});

export const menuItemUpdateSchema = menuItemSchema.extend({
  id: z.coerce.number().positive(),
});

export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
export type MenuCategoryUpdateInput = z.infer<typeof menuCategoryUpdateSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
