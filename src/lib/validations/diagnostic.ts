import { z } from "zod";

// Schema para criacao
export const diagnosticCreateSchema = z.object({
  title: z.string().min(3).max(255),
  answers: z.record(z.string(), z.array(z.number().min(0).max(3))),
  scores: z.record(z.string(), z.number().min(0).max(12)),
  overallScore: z.number().min(0).max(72),
  status: z.enum(["draft", "in_progress", "completed"]).default("draft"),
});

// Schema para update
export const diagnosticUpdateSchema = diagnosticCreateSchema.partial();

export type DiagnosticCreateInput = z.infer<typeof diagnosticCreateSchema>;
export type DiagnosticUpdateInput = z.infer<typeof diagnosticUpdateSchema>;
