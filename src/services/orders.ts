import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

export async function getAllOrders() {
  return db.select().from(orders).where(isNull(orders.deletedAt)).orderBy(orders.createdAt);
}

export async function updateOrderStatus(id: number, status: string) {
  const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
  return result[0];
}

export async function softDeleteOrder(id: number) {
  await db.update(orders).set({ deletedAt: new Date() }).where(eq(orders.id, id));
}
