import { z } from "zod";

const checklistItem = z.object({
  text: z.string().min(1),
  description: z.string().optional(),
});

export const checklistCreateSchema = z.object({
  title: z.string().min(3).max(255),
  items: z.array(checklistItem).min(1),
  role: z.enum(["manager", "staff", "all"]).default("all"),
});

export const checklistUpdateSchema = checklistCreateSchema.partial();

export const progressUpdateSchema = z.object({
  completedItems: z.array(z.number().int().min(0)),
});

export type ChecklistCreateInput = z.infer<typeof checklistCreateSchema>;
export type ChecklistUpdateInput = z.infer<typeof checklistUpdateSchema>;
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
