import { z } from "zod";

export const sopCreateSchema = z.object({
  title: z.string().min(3).max(255),
  category: z.string().min(1).max(100),
  content: z.string().min(1),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const sopUpdateSchema = sopCreateSchema.partial();

export type SopCreateInput = z.infer<typeof sopCreateSchema>;
export type SopUpdateInput = z.infer<typeof sopUpdateSchema>;
