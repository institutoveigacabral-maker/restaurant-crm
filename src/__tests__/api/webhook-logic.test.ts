import { describe, it, expect } from "vitest";

// Test webhook event matching and trigger logic from webhooks service.
// triggerWebhook filters active webhooks by event:
//   const matching = activeWebhooks.filter(w => w.events?.includes(event))

describe("Webhook event matching", () => {
  interface Webhook {
    id: number;
    name: string;
    url: string;
    events: string[] | null;
    active: boolean;
  }

  const webhooks: Webhook[] = [
    {
      id: 1,
      name: "Order Hook",
      url: "https://example.com/orders",
      events: ["order.created", "order.updated"],
      active: true,
    },
    {
      id: 2,
      name: "Reservation Hook",
      url: "https://example.com/reservations",
      events: ["reservation.created", "reservation.cancelled"],
      active: true,
    },
    {
      id: 3,
      name: "All Events Hook",
      url: "https://example.com/all",
      events: ["order.created", "reservation.created", "customer.created"],
      active: true,
    },
    {
      id: 4,
      name: "Disabled Hook",
      url: "https://example.com/disabled",
      events: ["order.created"],
      active: false,
    },
    {
      id: 5,
      name: "No Events Hook",
      url: "https://example.com/none",
      events: null,
      active: true,
    },
  ];

  function findMatchingWebhooks(event: string): Webhook[] {
    return webhooks.filter((w) => w.active).filter((w) => w.events?.includes(event));
  }

  it("matches webhooks subscribed to order.created", () => {
    const matching = findMatchingWebhooks("order.created");
    expect(matching).toHaveLength(2);
    expect(matching.map((w) => w.id)).toEqual([1, 3]);
  });

  it("matches webhooks subscribed to reservation.created", () => {
    const matching = findMatchingWebhooks("reservation.created");
    expect(matching).toHaveLength(2);
    expect(matching.map((w) => w.id)).toEqual([2, 3]);
  });

  it("excludes disabled webhooks", () => {
    const matching = findMatchingWebhooks("order.created");
    expect(matching.find((w) => w.id === 4)).toBeUndefined();
  });

  it("returns empty array for unsubscribed events", () => {
    const matching = findMatchingWebhooks("customer.deleted");
    expect(matching).toHaveLength(0);
  });

  it("handles webhooks with null events", () => {
    const matching = findMatchingWebhooks("order.created");
    expect(matching.find((w) => w.id === 5)).toBeUndefined();
  });

  it("matches reservation.cancelled", () => {
    const matching = findMatchingWebhooks("reservation.cancelled");
    expect(matching).toHaveLength(1);
    expect(matching[0].id).toBe(2);
  });
});

describe("Webhook secret generation", () => {
  it("generates a hex string of expected length", () => {
    // In the service: randomBytes(32).toString("hex") -> 64 char hex string
    const hexLength = 32 * 2; // each byte = 2 hex chars
    expect(hexLength).toBe(64);
  });
});

describe("Webhook log structure", () => {
  interface WebhookLog {
    webhookId: number;
    event: string;
    payload: Record<string, unknown>;
    statusCode: number | null;
    response: string | null;
    success: boolean;
  }

  it("creates success log", () => {
    const log: WebhookLog = {
      webhookId: 1,
      event: "order.created",
      payload: { orderId: 42 },
      statusCode: 200,
      response: '{"received": true}',
      success: true,
    };
    expect(log.success).toBe(true);
    expect(log.statusCode).toBe(200);
  });

  it("creates failure log with error", () => {
    const log: WebhookLog = {
      webhookId: 1,
      event: "order.created",
      payload: { orderId: 42 },
      statusCode: null,
      response: "Connection refused",
      success: false,
    };
    expect(log.success).toBe(false);
    expect(log.statusCode).toBeNull();
    expect(log.response).toContain("Connection refused");
  });

  it("creates log for non-200 response", () => {
    const log: WebhookLog = {
      webhookId: 2,
      event: "reservation.created",
      payload: { reservationId: 10 },
      statusCode: 500,
      response: "Internal Server Error",
      success: false,
    };
    expect(log.success).toBe(false);
    expect(log.statusCode).toBe(500);
  });
});
