import { db } from "@/db";
import { diagnostics } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { DiagnosticCreateInput, DiagnosticUpdateInput } from "@/lib/validations/diagnostic";

export async function getAllDiagnostics(tenantId: string) {
  return db
    .select()
    .from(diagnostics)
    .where(eq(diagnostics.tenantId, tenantId))
    .orderBy(desc(diagnostics.createdAt));
}

export async function getDiagnosticById(tenantId: string, id: number) {
  const result = await db
    .select()
    .from(diagnostics)
    .where(and(eq(diagnostics.tenantId, tenantId), eq(diagnostics.id, id)))
    .limit(1);
  return result[0] ?? null;
}

export async function createDiagnostic(
  tenantId: string,
  userId: string,
  data: DiagnosticCreateInput
) {
  const result = await db
    .insert(diagnostics)
    .values({
      tenantId,
      createdBy: userId,
      title: data.title,
      status: data.status || "draft",
      answers: data.answers,
      scores: data.scores,
      overallScore: data.overallScore.toString(),
      completedAt: data.status === "completed" ? new Date() : null,
    })
    .returning();
  return result[0];
}

export async function updateDiagnostic(tenantId: string, id: number, data: DiagnosticUpdateInput) {
  const values: Record<string, unknown> = {};

  if (data.title !== undefined) values.title = data.title;
  if (data.answers !== undefined) values.answers = data.answers;
  if (data.scores !== undefined) values.scores = data.scores;
  if (data.overallScore !== undefined) values.overallScore = data.overallScore.toString();
  if (data.status !== undefined) {
    values.status = data.status;
    if (data.status === "completed") {
      values.completedAt = new Date();
    }
  }

  const result = await db
    .update(diagnostics)
    .set(values)
    .where(and(eq(diagnostics.tenantId, tenantId), eq(diagnostics.id, id)))
    .returning();
  return result[0] ?? null;
}
