import { db } from "@/db";
import { webhooks, webhookLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes, createHmac } from "crypto";

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function getAllWebhooks(tenantId: string) {
  return db
    .select()
    .from(webhooks)
    .where(eq(webhooks.tenantId, tenantId))
    .orderBy(desc(webhooks.createdAt));
}

export async function createWebhook(
  tenantId: string,
  data: { name: string; url: string; events: string[] }
) {
  const secret = randomBytes(32).toString("hex");
  const result = await db
    .insert(webhooks)
    .values({
      tenantId,
      name: data.name,
      url: data.url,
      events: data.events,
      secret,
    })
    .returning();
  return result[0];
}

export async function updateWebhook(
  tenantId: string,
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

  const result = await db
    .update(webhooks)
    .set(values)
    .where(and(eq(webhooks.tenantId, tenantId), eq(webhooks.id, id)))
    .returning();
  return result[0];
}

export async function deleteWebhook(tenantId: string, id: number) {
  await db.delete(webhooks).where(and(eq(webhooks.tenantId, tenantId), eq(webhooks.id, id)));
}

export async function triggerWebhook(
  tenantId: string,
  event: string,
  payload: Record<string, unknown>
) {
  const activeWebhooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.tenantId, tenantId), eq(webhooks.active, true)));

  const matching = activeWebhooks.filter((w) => w.events?.includes(event));

  if (matching.length === 0) return;

  const promises = matching.map(async (webhook) => {
    let statusCode: number | null = null;
    let responseText: string | null = null;
    let success = false;

    try {
      const body = JSON.stringify(payload);
      const signature = webhook.secret ? signPayload(body, webhook.secret) : "";
      const timestamp = Math.floor(Date.now() / 1000).toString();

      const res = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Event": event,
          "X-Webhook-Signature": `sha256=${signature}`,
          "X-Webhook-Timestamp": timestamp,
        },
        body,
      });

      statusCode = res.status;
      responseText = await res.text().catch(() => null);
      success = res.ok;
    } catch (err) {
      responseText = err instanceof Error ? err.message : "Erro desconhecido";
    }

    await db.insert(webhookLogs).values({
      tenantId,
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

export async function getWebhookLogs(tenantId: string, webhookId: number, limit = 10) {
  return db
    .select()
    .from(webhookLogs)
    .where(and(eq(webhookLogs.tenantId, tenantId), eq(webhookLogs.webhookId, webhookId)))
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);
}
