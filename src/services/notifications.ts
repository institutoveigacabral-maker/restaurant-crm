import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, isNull, or, desc, sql } from "drizzle-orm";

interface CreateNotificationData {
  userId?: string | null;
  title: string;
  message: string;
  type: string;
  link?: string;
}

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(or(eq(notifications.userId, userId), isNull(notifications.userId)))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      sql`(${notifications.userId} = ${userId} OR ${notifications.userId} IS NULL) AND ${notifications.read} = false`
    );
  return Number(result[0]?.count ?? 0);
}

export async function markAsRead(id: number) {
  return db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

export async function markAllAsRead(userId: string) {
  return db
    .update(notifications)
    .set({ read: true })
    .where(or(eq(notifications.userId, userId), isNull(notifications.userId)));
}

export async function createNotification(data: CreateNotificationData) {
  const result = await db
    .insert(notifications)
    .values({
      userId: data.userId ?? null,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link ?? null,
    })
    .returning();
  return result[0];
}
