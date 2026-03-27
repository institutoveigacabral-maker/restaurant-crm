import { db } from "@/db";
import {
  employeeProfiles,
  xpTransactions,
  badges,
  employeeBadges,
  courseEnrollments,
  courses,
  users,
} from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// ── Level Calculation ────────────────────────────────────────

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];

export function calculateLevel(totalXp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_THRESHOLDS[i]) {
      if (i >= XP_THRESHOLDS.length - 1) {
        const extraXp = totalXp - XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
        return XP_THRESHOLDS.length + Math.floor(extraXp / 1500);
      }
      return i + 1;
    }
  }
  return 1;
}

// ── Profile ──────────────────────────────────────────────────

export async function getOrCreateProfile(tenantId: string, userId: string) {
  const existing = await db
    .select()
    .from(employeeProfiles)
    .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const user = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const result = await db
    .insert(employeeProfiles)
    .values({
      tenantId,
      userId,
      displayName: user[0]?.name ?? null,
    })
    .returning();

  return result[0];
}

export async function getProfile(tenantId: string, userId: string) {
  const profile = await db
    .select()
    .from(employeeProfiles)
    .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)))
    .limit(1);

  if (!profile[0]) {
    return null;
  }

  const earnedBadges = await db
    .select({
      id: badges.id,
      name: badges.name,
      icon: badges.icon,
      rarity: badges.rarity,
      earnedAt: employeeBadges.earnedAt,
    })
    .from(employeeBadges)
    .innerJoin(badges, eq(employeeBadges.badgeId, badges.id))
    .where(and(eq(employeeBadges.tenantId, tenantId), eq(employeeBadges.userId, userId)));

  const recentXp = await db
    .select()
    .from(xpTransactions)
    .where(and(eq(xpTransactions.tenantId, tenantId), eq(xpTransactions.userId, userId)))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(5);

  return {
    ...profile[0],
    earnedBadges,
    recentXp,
  };
}

// ── XP ───────────────────────────────────────────────────────

export async function addXp(
  tenantId: string,
  userId: string,
  amount: number,
  source: string,
  sourceId?: string,
  description?: string
) {
  await getOrCreateProfile(tenantId, userId);

  await db.insert(xpTransactions).values({
    tenantId,
    userId,
    amount,
    source,
    sourceId: sourceId ?? null,
    description: description ?? null,
  });

  const result = await db
    .update(employeeProfiles)
    .set({
      totalXp: sql`${employeeProfiles.totalXp} + ${amount}`,
    })
    .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)))
    .returning();

  if (result[0]) {
    const newLevel = calculateLevel(result[0].totalXp ?? 0);
    if (newLevel !== result[0].level) {
      await db
        .update(employeeProfiles)
        .set({ level: newLevel })
        .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)));
    }
  }

  return result[0];
}

/** Alias kept for backward compatibility with existing API routes */
export const awardXp = addXp;

// ── Leaderboard & History ────────────────────────────────────

export async function getLeaderboard(tenantId: string, limit = 10) {
  return db
    .select({
      userId: employeeProfiles.userId,
      displayName: employeeProfiles.displayName,
      avatar: employeeProfiles.avatar,
      totalXp: employeeProfiles.totalXp,
      level: employeeProfiles.level,
      streak: employeeProfiles.streak,
      badgesEarned: employeeProfiles.badgesEarned,
      coursesCompleted: employeeProfiles.coursesCompleted,
    })
    .from(employeeProfiles)
    .where(eq(employeeProfiles.tenantId, tenantId))
    .orderBy(desc(employeeProfiles.totalXp))
    .limit(limit);
}

export async function getXpHistory(tenantId: string, userId: string, limit = 20) {
  return db
    .select()
    .from(xpTransactions)
    .where(and(eq(xpTransactions.tenantId, tenantId), eq(xpTransactions.userId, userId)))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(limit);
}

// ── Streak ───────────────────────────────────────────────────

export async function updateStreak(tenantId: string, userId: string) {
  const profile = await db
    .select()
    .from(employeeProfiles)
    .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)))
    .limit(1);

  if (!profile[0]) return null;

  const today = new Date().toISOString().split("T")[0];
  const lastActivity = profile[0].lastActivityDate;

  let newStreak = 1;
  if (lastActivity) {
    const lastDate = new Date(lastActivity);
    const todayDate = new Date(today);
    const diffMs = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return profile[0];
    } else if (diffDays === 1) {
      newStreak = (profile[0].streak ?? 0) + 1;
    }
  }

  const result = await db
    .update(employeeProfiles)
    .set({
      streak: newStreak,
      lastActivityDate: today,
    })
    .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)))
    .returning();

  return result[0];
}

// ── Badges ───────────────────────────────────────────────────

interface BadgeCriteria {
  type: string;
  value: number;
}

interface CreateBadgeInput {
  name: string;
  description?: string;
  icon: string;
  category: string;
  xpReward?: number;
  criteria?: BadgeCriteria;
  rarity?: string;
}

export async function getAllBadges(tenantId: string) {
  return db
    .select()
    .from(badges)
    .where(and(eq(badges.tenantId, tenantId), eq(badges.active, true)));
}

export async function createBadge(tenantId: string, data: CreateBadgeInput) {
  const result = await db
    .insert(badges)
    .values({
      tenantId,
      name: data.name,
      description: data.description ?? null,
      icon: data.icon,
      category: data.category,
      xpReward: data.xpReward ?? 100,
      criteria: data.criteria ?? null,
      rarity: data.rarity ?? "common",
    })
    .returning();

  return result[0];
}

export async function getBadges(tenantId: string, userId: string) {
  const allBadges = await db
    .select()
    .from(badges)
    .where(and(eq(badges.tenantId, tenantId), eq(badges.active, true)));

  const earnedBadgeIds = (
    await db
      .select({ badgeId: employeeBadges.badgeId })
      .from(employeeBadges)
      .where(and(eq(employeeBadges.tenantId, tenantId), eq(employeeBadges.userId, userId)))
  ).map((b) => b.badgeId);

  return allBadges.map((badge) => ({
    ...badge,
    earned: earnedBadgeIds.includes(badge.id),
  }));
}

export async function awardBadge(tenantId: string, userId: string, badgeId: number) {
  await db.insert(employeeBadges).values({
    tenantId,
    userId,
    badgeId,
  });

  const badge = await db
    .select()
    .from(badges)
    .where(and(eq(badges.tenantId, tenantId), eq(badges.id, badgeId)))
    .limit(1);

  if (badge[0]?.xpReward) {
    await addXp(
      tenantId,
      userId,
      badge[0].xpReward,
      "badge",
      String(badgeId),
      `Badge: ${badge[0].name}`
    );
  }

  await db
    .update(employeeProfiles)
    .set({
      badgesEarned: sql`${employeeProfiles.badgesEarned} + 1`,
    })
    .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)));

  return badge[0] ?? null;
}

export async function checkAndAwardBadges(tenantId: string, userId: string) {
  const profile = await db
    .select()
    .from(employeeProfiles)
    .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)))
    .limit(1);

  if (!profile[0]) return [];

  const allBadges = await db
    .select()
    .from(badges)
    .where(and(eq(badges.tenantId, tenantId), eq(badges.active, true)));

  const earnedBadgeIds = (
    await db
      .select({ badgeId: employeeBadges.badgeId })
      .from(employeeBadges)
      .where(and(eq(employeeBadges.tenantId, tenantId), eq(employeeBadges.userId, userId)))
  ).map((b) => b.badgeId);

  const completedCourses = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.tenantId, tenantId),
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.status, "completed")
      )
    );

  const mandatoryCourses = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(
      and(
        eq(courseEnrollments.tenantId, tenantId),
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.status, "completed"),
        eq(courses.mandatory, true)
      )
    );

  const totalMandatory = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courses)
    .where(and(eq(courses.tenantId, tenantId), eq(courses.mandatory, true)));

  const stats = {
    courses_completed: completedCourses[0]?.count ?? 0,
    level: profile[0].level ?? 1,
    streak: profile[0].streak ?? 0,
    total_xp: profile[0].totalXp ?? 0,
    all_mandatory_completed:
      (totalMandatory[0]?.count ?? 0) > 0 &&
      (mandatoryCourses[0]?.count ?? 0) >= (totalMandatory[0]?.count ?? 0),
  };

  const newlyAwarded: typeof allBadges = [];

  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge.id)) continue;

    const criteria = badge.criteria as BadgeCriteria | null;
    if (!criteria) continue;

    let earned = false;

    switch (criteria.type) {
      case "courses_completed":
        earned = stats.courses_completed >= criteria.value;
        break;
      case "level":
        earned = stats.level >= criteria.value;
        break;
      case "streak":
        earned = stats.streak >= criteria.value;
        break;
      case "total_xp":
        earned = stats.total_xp >= criteria.value;
        break;
      case "all_mandatory_completed":
        earned = stats.all_mandatory_completed;
        break;
    }

    if (earned) {
      await db.insert(employeeBadges).values({
        tenantId,
        userId,
        badgeId: badge.id,
      });

      if (badge.xpReward) {
        await addXp(
          tenantId,
          userId,
          badge.xpReward,
          "badge",
          String(badge.id),
          `Badge: ${badge.name}`
        );
      }

      newlyAwarded.push(badge);
    }
  }

  if (newlyAwarded.length > 0) {
    await db
      .update(employeeProfiles)
      .set({
        badgesEarned: sql`${employeeProfiles.badgesEarned} + ${newlyAwarded.length}`,
      })
      .where(and(eq(employeeProfiles.tenantId, tenantId), eq(employeeProfiles.userId, userId)));
  }

  return newlyAwarded;
}
