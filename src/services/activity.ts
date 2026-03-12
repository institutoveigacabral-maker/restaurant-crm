import { db } from "@/db";
import { activityLog } from "@/db/schema";

export async function logActivity(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string | number,
  details?: Record<string, unknown>
) {
  await db.insert(activityLog).values({
    userId,
    action,
    entity,
    entityId: entityId?.toString() ?? null,
    details: details ?? null,
  });
}
