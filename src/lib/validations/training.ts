import { z } from "zod";

export const courseCreateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  durationMinutes: z.number().int().min(1).optional(),
  xpReward: z.number().int().min(0).default(100),
  mandatory: z.boolean().default(false),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export const enrollmentUpdateSchema = z.object({
  progress: z.number().int().min(0).max(100),
  score: z.number().int().min(0).max(100).optional(),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type EnrollmentUpdateInput = z.infer<typeof enrollmentUpdateSchema>;
