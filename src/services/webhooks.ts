import { db } from "@/db";
import { webhooks, webhookLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function getAllWebhooks() {
  return db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
}

export async function createWebhook(data: { name: string; url: string; events: string[] }) {
  const secret = randomBytes(32).toString("hex");
  const result = await db
    .insert(webhooks)
    .values({
      name: data.name,
      url: data.url,
      events: data.events,
      secret,
    })
    .returning();
  return result[0];
}

export async function updateWebhook(
  id: number,
  data: {
    name?: string;
    url?: string;
    events?: string[];
    active?: boolean;
  }
) {
  const values: Record<string, unknown> = {};
  if (data.name !== undefined) values.name = data.name;
  if (data.url !== undefined) values.url = data.url;
  if (data.events !== undefined) values.events = data.events;
  if (data.active !== undefined) values.active = data.active;

  const result = await db.update(webhooks).set(values).where(eq(webhooks.id, id)).returning();
  return result[0];
}

export async function deleteWebhook(id: number) {
  await db.delete(webhooks).where(eq(webhooks.id, id));
}

export async function triggerWebhook(event: string, payload: Record<string, unknown>) {
  const activeWebhooks = await db.select().from(webhooks).where(eq(webhooks.active, true));

  const matching = activeWebhooks.filter((w) => w.events?.includes(event));

  if (matching.length === 0) return;

  const promises = matching.map(async (webhook) => {
    let statusCode: number | null = null;
    let responseText: string | null = null;
    let success = false;

    try {
      const res = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": webhook.secret ?? "",
          "X-Webhook-Event": event,
        },
        body: JSON.stringify(payload),
      });

      statusCode = res.status;
      responseText = await res.text().catch(() => null);
      success = res.ok;
    } catch (err) {
      responseText = err instanceof Error ? err.message : "Erro desconhecido";
    }

    await db.insert(webhookLogs).values({
      webhookId: webhook.id,
      event,
      payload,
      statusCode,
      response: responseText,
      success,
    });
  });

  Promise.allSettled(promises);
}

export async function getWebhookLogs(webhookId: number, limit = 10) {
  return db
    .select()
    .from(webhookLogs)
    .where(and(eq(webhookLogs.webhookId, webhookId)))
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);
}
