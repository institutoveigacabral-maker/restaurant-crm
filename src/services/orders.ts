import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function getAllOrders(tenantId: string) {
  return db
    .select()
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), isNull(orders.deletedAt)))
    .orderBy(orders.createdAt);
}

export async function updateOrderStatus(tenantId: string, id: number, status: string) {
  const result = await db
    .update(orders)
    .set({ status })
    .where(and(eq(orders.tenantId, tenantId), eq(orders.id, id)))
    .returning();
  return result[0];
}

export async function softDeleteOrder(tenantId: string, id: number) {
  await db
    .update(orders)
    .set({ deletedAt: new Date() })
    .where(and(eq(orders.tenantId, tenantId), eq(orders.id, id)));
}
