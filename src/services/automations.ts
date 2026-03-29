import { db } from "@/db";
import { automations, automationLogs } from "@/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import {
  AutomationCreateInput,
  AutomationUpdateInput,
  AUTOMATION_TYPE_TRIGGERS,
  AUTOMATION_TYPE_ACTIONS,
  AutomationType,
} from "@/lib/validations/automation";

export async function getAllAutomations(tenantId: string) {
  return db
    .select()
    .from(automations)
    .where(eq(automations.tenantId, tenantId))
    .orderBy(desc(automations.createdAt));
}

export async function getAutomationById(tenantId: string, id: number) {
  const result = await db
    .select()
    .from(automations)
    .where(and(eq(automations.tenantId, tenantId), eq(automations.id, id)))
    .limit(1);
  return result[0] ?? null;
}

export async function createAutomation(tenantId: string, data: AutomationCreateInput) {
  const type = data.type as AutomationType;
  const result = await db
    .insert(automations)
    .values({
      tenantId,
      name: data.name,
      type: data.type,
      trigger: { event: type, description: AUTOMATION_TYPE_TRIGGERS[type] },
      actions: [{ type: "email", description: AUTOMATION_TYPE_ACTIONS[type] }],
      active: data.active ?? true,
    })
    .returning();
  return result[0];
}

export async function updateAutomation(tenantId: string, id: number, data: AutomationUpdateInput) {
  const existing = await getAutomationById(tenantId, id);
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.type !== undefined) {
    const type = data.type as AutomationType;
    updateData.type = type;
    updateData.trigger = { event: type, description: AUTOMATION_TYPE_TRIGGERS[type] };
    updateData.actions = [{ type: "email", description: AUTOMATION_TYPE_ACTIONS[type] }];
  }

  const result = await db
    .update(automations)
    .set(updateData)
    .where(and(eq(automations.tenantId, tenantId), eq(automations.id, id)))
    .returning();
  return result[0] ?? null;
}

export async function toggleAutomation(tenantId: string, id: number) {
  const existing = await getAutomationById(tenantId, id);
  if (!existing) return null;

  const result = await db
    .update(automations)
    .set({ active: !existing.active })
    .where(and(eq(automations.tenantId, tenantId), eq(automations.id, id)))
    .returning();
  return result[0] ?? null;
}

export async function deleteAutomation(tenantId: string, id: number) {
  await db
    .delete(automations)
    .where(and(eq(automations.tenantId, tenantId), eq(automations.id, id)));
}

export async function logExecution(
  automationId: number,
  tenantId: string,
  status: string,
  input?: unknown,
  output?: unknown
) {
  const result = await db
    .insert(automationLogs)
    .values({
      automationId,
      tenantId,
      status,
      input: input ?? null,
      output: output ?? null,
    })
    .returning();

  await db
    .update(automations)
    .set({
      executionCount: sql`${automations.executionCount} + 1`,
      lastExecutedAt: new Date(),
    })
    .where(eq(automations.id, automationId));

  return result[0];
}

export async function getAutomationLogs(tenantId: string, automationId: number, limit = 50) {
  return db
    .select()
    .from(automationLogs)
    .where(
      and(eq(automationLogs.tenantId, tenantId), eq(automationLogs.automationId, automationId))
    )
    .orderBy(desc(automationLogs.executedAt))
    .limit(limit);
}
