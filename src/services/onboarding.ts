import { db } from "@/db";
import { onboardingChecklists, onboardingProgress } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ChecklistCreateInput, ChecklistUpdateInput } from "@/lib/validations/onboarding";

export async function getAllChecklists(tenantId: string) {
  return db
    .select()
    .from(onboardingChecklists)
    .where(eq(onboardingChecklists.tenantId, tenantId))
    .orderBy(desc(onboardingChecklists.createdAt));
}

export async function getChecklistById(tenantId: string, id: number) {
  const result = await db
    .select()
    .from(onboardingChecklists)
    .where(and(eq(onboardingChecklists.tenantId, tenantId), eq(onboardingChecklists.id, id)))
    .limit(1);
  return result[0] ?? null;
}

export async function createChecklist(tenantId: string, data: ChecklistCreateInput) {
  const result = await db
    .insert(onboardingChecklists)
    .values({
      tenantId,
      title: data.title,
      items: data.items,
      role: data.role ?? "all",
      active: true,
    })
    .returning();
  return result[0];
}

export async function updateChecklist(tenantId: string, id: number, data: ChecklistUpdateInput) {
  const existing = await getChecklistById(tenantId, id);
  if (!existing) return null;

  const result = await db
    .update(onboardingChecklists)
    .set({
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.items !== undefined ? { items: data.items } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
    })
    .where(and(eq(onboardingChecklists.tenantId, tenantId), eq(onboardingChecklists.id, id)))
    .returning();
  return result[0] ?? null;
}

export async function deleteChecklist(tenantId: string, id: number) {
  await db
    .delete(onboardingChecklists)
    .where(and(eq(onboardingChecklists.tenantId, tenantId), eq(onboardingChecklists.id, id)));
}

export async function getProgressForUser(tenantId: string, userId: string, checklistId: number) {
  const result = await db
    .select()
    .from(onboardingProgress)
    .where(
      and(
        eq(onboardingProgress.tenantId, tenantId),
        eq(onboardingProgress.userId, userId),
        eq(onboardingProgress.checklistId, checklistId)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

export async function updateProgress(
  tenantId: string,
  userId: string,
  checklistId: number,
  completedItems: number[]
) {
  const checklist = await getChecklistById(tenantId, checklistId);
  if (!checklist) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalItems = (checklist.items as any[]).length;
  const allCompleted = completedItems.length >= totalItems;

  const existing = await getProgressForUser(tenantId, userId, checklistId);

  if (existing) {
    const result = await db
      .update(onboardingProgress)
      .set({
        completedItems,
        completedAt: allCompleted ? new Date() : null,
      })
      .where(eq(onboardingProgress.id, existing.id))
      .returning();
    return result[0] ?? null;
  }

  const result = await db
    .insert(onboardingProgress)
    .values({
      tenantId,
      userId,
      checklistId,
      completedItems,
      completedAt: allCompleted ? new Date() : null,
    })
    .returning();
  return result[0];
}
