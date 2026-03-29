import { db } from "@/db";
import { documents } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { DocumentCreateInput, DocumentUpdateInput } from "@/lib/validations/document";

export async function getAllDocuments(tenantId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.tenantId, tenantId))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentById(tenantId: string, id: number) {
  const result = await db
    .select()
    .from(documents)
    .where(and(eq(documents.tenantId, tenantId), eq(documents.id, id)))
    .limit(1);
  return result[0] ?? null;
}

export async function createDocument(tenantId: string, userId: string, data: DocumentCreateInput) {
  const result = await db
    .insert(documents)
    .values({
      tenantId,
      name: data.name,
      type: data.type,
      url: data.url ?? null,
      metadata: data.metadata ?? {},
      uploadedBy: userId,
    })
    .returning();
  return result[0];
}

export async function updateDocument(tenantId: string, id: number, data: DocumentUpdateInput) {
  const existing = await getDocumentById(tenantId, id);
  if (!existing) return null;

  const result = await db
    .update(documents)
    .set({
      ...data,
      url: data.url ?? existing.url,
    })
    .where(and(eq(documents.tenantId, tenantId), eq(documents.id, id)))
    .returning();
  return result[0] ?? null;
}

export async function deleteDocument(tenantId: string, id: number) {
  await db.delete(documents).where(and(eq(documents.tenantId, tenantId), eq(documents.id, id)));
}
