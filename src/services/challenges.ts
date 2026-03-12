import { db } from "@/db";
import { challenges, challengeParticipations } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { awardXp } from "./gamification";

export async function getActiveChallenges(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const activeChallenges = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.active, true),
        lte(challenges.startDate, today),
        gte(challenges.endDate, today)
      )
    )
    .orderBy(challenges.endDate);

  const participations = await db
    .select()
    .from(challengeParticipations)
    .where(eq(challengeParticipations.userId, userId));

  const participationMap = new Map(participations.map((p) => [p.challengeId, p]));

  return activeChallenges.map((challenge) => {
    const participation = participationMap.get(challenge.id);
    return {
      ...challenge,
      joined: !!participation,
      currentProgress: participation?.currentProgress ?? 0,
      completed: participation?.completed ?? false,
      completedAt: participation?.completedAt ?? null,
    };
  });
}

export async function joinChallenge(userId: string, challengeId: number) {
  const existing = await db
    .select()
    .from(challengeParticipations)
    .where(
      and(
        eq(challengeParticipations.userId, userId),
        eq(challengeParticipations.challengeId, challengeId)
      )
    )
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const result = await db
    .insert(challengeParticipations)
    .values({
      userId,
      challengeId,
      currentProgress: 0,
      completed: false,
    })
    .returning();

  return result[0];
}

export async function updateProgress(userId: string, challengeId: number, progress: number) {
  const participation = await db
    .select()
    .from(challengeParticipations)
    .where(
      and(
        eq(challengeParticipations.userId, userId),
        eq(challengeParticipations.challengeId, challengeId)
      )
    )
    .limit(1);

  if (!participation[0] || participation[0].completed) {
    return participation[0] ?? null;
  }

  const challenge = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);

  if (!challenge[0]) return null;

  const goal = challenge[0].goal as { type: string; target: number };
  const isCompleted = progress >= goal.target;

  const updateData: Record<string, unknown> = {
    currentProgress: progress,
  };

  if (isCompleted) {
    updateData.completed = true;
    updateData.completedAt = new Date();
  }

  const result = await db
    .update(challengeParticipations)
    .set(updateData)
    .where(
      and(
        eq(challengeParticipations.userId, userId),
        eq(challengeParticipations.challengeId, challengeId)
      )
    )
    .returning();

  if (isCompleted) {
    await awardXp(
      userId,
      challenge[0].xpReward ?? 200,
      "challenge",
      String(challengeId),
      `Challenge: ${challenge[0].title}`
    );
  }

  return result[0] ?? null;
}

interface CreateChallengeInput {
  title: string;
  description?: string;
  type: string;
  category: string;
  goal: { type: string; target: number };
  xpReward?: number;
  startDate: string;
  endDate: string;
}

export async function createChallenge(data: CreateChallengeInput) {
  const result = await db
    .insert(challenges)
    .values({
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      category: data.category,
      goal: data.goal,
      xpReward: data.xpReward ?? 200,
      startDate: data.startDate,
      endDate: data.endDate,
    })
    .returning();

  return result[0];
}

export async function getChallengeLeaderboard(challengeId: number) {
  return db
    .select({
      userId: challengeParticipations.userId,
      currentProgress: challengeParticipations.currentProgress,
      completed: challengeParticipations.completed,
      completedAt: challengeParticipations.completedAt,
    })
    .from(challengeParticipations)
    .where(eq(challengeParticipations.challengeId, challengeId))
    .orderBy(
      desc(challengeParticipations.completed),
      desc(challengeParticipations.currentProgress)
    );
}

export async function getUserChallenges(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  return db
    .select({
      participation: challengeParticipations,
      challenge: challenges,
    })
    .from(challengeParticipations)
    .innerJoin(challenges, eq(challengeParticipations.challengeId, challenges.id))
    .where(and(eq(challengeParticipations.userId, userId), gte(challenges.endDate, today)))
    .orderBy(challenges.endDate);
}

/** Alias for spec-compatible naming */
export const updateChallengeProgress = updateProgress;
