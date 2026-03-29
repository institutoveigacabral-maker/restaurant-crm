import { z } from "zod";

export const badgeAwardSchema = z.object({
  userId: z.string().min(1),
  badgeId: z.coerce.number().int().positive(),
});

export const challengeProgressSchema = z.object({
  userId: z.string().optional(),
  progress: z.number().int().min(0),
});

export type BadgeAwardInput = z.infer<typeof badgeAwardSchema>;
export type ChallengeProgressInput = z.infer<typeof challengeProgressSchema>;
