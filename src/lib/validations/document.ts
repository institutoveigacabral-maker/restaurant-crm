import { z } from "zod";

export const documentCreateSchema = z.object({
  name: z.string().min(3).max(255),
  type: z.enum(["manual", "template", "policy", "checklist", "other"]),
  url: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const documentUpdateSchema = documentCreateSchema.partial();

export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
