import { db } from "@/db";
import { courses, courseEnrollments } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { awardXp } from "./gamification";

interface CreateCourseInput {
  title: string;
  description?: string;
  category: string;
  difficulty?: string;
  pillbitsUrl?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  xpReward?: number;
  requiredLevel?: number;
  mandatory?: boolean;
  sortOrder?: number;
}

interface UpdateCourseInput {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  pillbitsUrl?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  xpReward?: number;
  requiredLevel?: number;
  mandatory?: boolean;
  active?: boolean;
  sortOrder?: number;
}

export async function getCourses(tenantId: string, category?: string, difficulty?: string) {
  const conditions = [eq(courses.tenantId, tenantId), eq(courses.active, true)];

  if (category) {
    conditions.push(eq(courses.category, category));
  }
  if (difficulty) {
    conditions.push(eq(courses.difficulty, difficulty));
  }

  return db
    .select({
      course: courses,
      enrollmentCount: sql<number>`count(${courseEnrollments.id})::int`,
    })
    .from(courses)
    .leftJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
    .where(and(...conditions))
    .groupBy(courses.id)
    .orderBy(courses.sortOrder, courses.createdAt);
}

export async function getCourseById(tenantId: string, id: number) {
  const result = await db
    .select({
      course: courses,
      enrollmentCount: sql<number>`count(${courseEnrollments.id})::int`,
    })
    .from(courses)
    .leftJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
    .where(and(eq(courses.tenantId, tenantId), eq(courses.id, id)))
    .groupBy(courses.id)
    .limit(1);

  return result[0] ?? null;
}

export async function createCourse(tenantId: string, data: CreateCourseInput) {
  const result = await db
    .insert(courses)
    .values({
      tenantId,
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      difficulty: data.difficulty ?? "iniciante",
      pillbitsUrl: data.pillbitsUrl ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      durationMinutes: data.durationMinutes ?? 5,
      xpReward: data.xpReward ?? 50,
      requiredLevel: data.requiredLevel ?? 1,
      mandatory: data.mandatory ?? false,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();

  return result[0];
}

export async function updateCourse(tenantId: string, id: number, data: UpdateCourseInput) {
  const result = await db
    .update(courses)
    .set(data)
    .where(and(eq(courses.tenantId, tenantId), eq(courses.id, id)))
    .returning();

  return result[0] ?? null;
}

export async function deleteCourse(tenantId: string, id: number) {
  const result = await db
    .update(courses)
    .set({ active: false })
    .where(and(eq(courses.tenantId, tenantId), eq(courses.id, id)))
    .returning();

  return result[0] ?? null;
}

export async function getEnrollments(tenantId: string, userId: string) {
  return db
    .select({
      enrollment: courseEnrollments,
      course: courses,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(and(eq(courseEnrollments.tenantId, tenantId), eq(courseEnrollments.userId, userId)))
    .orderBy(desc(courseEnrollments.createdAt));
}

export async function enrollUser(tenantId: string, userId: string, courseId: number) {
  const existing = await db
    .select()
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.tenantId, tenantId),
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.courseId, courseId)
      )
    )
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const result = await db
    .insert(courseEnrollments)
    .values({
      tenantId,
      userId,
      courseId,
      status: "enrolled",
      progress: 0,
    })
    .returning();

  return result[0];
}

export async function updateProgress(
  tenantId: string,
  enrollmentId: number,
  progress: number,
  score?: number
) {
  const enrollment = await db
    .select()
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.tenantId, tenantId), eq(courseEnrollments.id, enrollmentId)))
    .limit(1);

  if (!enrollment[0]) return null;

  const isCompleted = progress >= 100;
  const now = new Date();

  const updateData: Record<string, unknown> = {
    progress: Math.min(progress, 100),
    status: isCompleted ? "completed" : "in_progress",
    startedAt: sql`COALESCE(${courseEnrollments.startedAt}, ${now})`,
  };

  if (score !== undefined) {
    updateData.score = score;
  }

  if (isCompleted) {
    updateData.completedAt = now;
  }

  const result = await db
    .update(courseEnrollments)
    .set(updateData)
    .where(and(eq(courseEnrollments.tenantId, tenantId), eq(courseEnrollments.id, enrollmentId)))
    .returning();

  if (isCompleted && result[0]) {
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, enrollment[0].courseId))
      .limit(1);

    if (course[0]) {
      await awardXp(
        tenantId,
        enrollment[0].userId,
        course[0].xpReward ?? 50,
        "course",
        String(course[0].id),
        `Completed: ${course[0].title}`
      );
    }
  }

  return result[0] ?? null;
}

export async function getCourseStats(tenantId: string, courseId: number) {
  const enrollmentCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.tenantId, tenantId), eq(courseEnrollments.courseId, courseId)));

  const completedCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.tenantId, tenantId),
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.status, "completed")
      )
    );

  const avgScore = await db
    .select({
      avg: sql<number>`COALESCE(avg(${courseEnrollments.score}), 0)::int`,
    })
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.tenantId, tenantId),
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.status, "completed")
      )
    );

  const total = enrollmentCount[0]?.count ?? 0;
  const completed = completedCount[0]?.count ?? 0;

  return {
    enrollmentCount: total,
    completedCount: completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    averageScore: avgScore[0]?.avg ?? 0,
  };
}

/** Aliases for spec-compatible naming */
export const getAllCourses = getCourses;
export const enrollInCourse = enrollUser;
export const getUserEnrollments = getEnrollments;
