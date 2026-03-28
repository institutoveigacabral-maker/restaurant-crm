import { db } from "@/db";
import { sops } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { SopCreateInput, SopUpdateInput } from "@/lib/validations/sop";

export async function getAllSops(tenantId: string) {
  return db.select().from(sops).where(eq(sops.tenantId, tenantId)).orderBy(desc(sops.updatedAt));
}

export async function getSopById(tenantId: string, id: number) {
  const result = await db
    .select()
    .from(sops)
    .where(and(eq(sops.tenantId, tenantId), eq(sops.id, id)))
    .limit(1);
  return result[0] ?? null;
}

export async function createSop(tenantId: string, userId: string, data: SopCreateInput) {
  const result = await db
    .insert(sops)
    .values({
      tenantId,
      title: data.title,
      category: data.category,
      content: data.content,
      status: data.status ?? "draft",
      createdBy: userId,
    })
    .returning();
  return result[0];
}

export async function updateSop(tenantId: string, id: number, data: SopUpdateInput) {
  const existing = await getSopById(tenantId, id);
  if (!existing) return null;

  const contentChanged = data.content !== undefined && data.content !== existing.content;

  const result = await db
    .update(sops)
    .set({
      ...data,
      ...(contentChanged ? { version: (existing.version ?? 1) + 1 } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(sops.tenantId, tenantId), eq(sops.id, id)))
    .returning();
  return result[0] ?? null;
}

export async function publishSop(tenantId: string, id: number) {
  const result = await db
    .update(sops)
    .set({ status: "published", updatedAt: new Date() })
    .where(and(eq(sops.tenantId, tenantId), eq(sops.id, id)))
    .returning();
  return result[0] ?? null;
}

export async function deleteSop(tenantId: string, id: number) {
  await db.delete(sops).where(and(eq(sops.tenantId, tenantId), eq(sops.id, id)));
}
