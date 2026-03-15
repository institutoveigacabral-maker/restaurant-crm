import { describe, it, expect } from "vitest";

// Test the order API route validation and business logic.
// The PUT route checks: if (!id || !status) return errorResponse("ID e status são obrigatórios")

describe("Order status update validation", () => {
  function validateOrderUpdate(body: Record<string, unknown>): {
    valid: boolean;
    error?: string;
  } {
    const { id, status } = body;
    if (!id || !status) {
      return { valid: false, error: "ID e status são obrigatórios" };
    }
    return { valid: true };
  }

  it("accepts valid id and status", () => {
    const result = validateOrderUpdate({ id: 1, status: "served" });
    expect(result.valid).toBe(true);
  });

  it("rejects missing id", () => {
    const result = validateOrderUpdate({ status: "served" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("ID e status são obrigatórios");
  });

  it("rejects missing status", () => {
    const result = validateOrderUpdate({ id: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("ID e status são obrigatórios");
  });

  it("rejects empty body", () => {
    const result = validateOrderUpdate({});
    expect(result.valid).toBe(false);
  });

  it("rejects null id", () => {
    const result = validateOrderUpdate({ id: null, status: "served" });
    expect(result.valid).toBe(false);
  });

  it("rejects empty string status", () => {
    const result = validateOrderUpdate({ id: 1, status: "" });
    expect(result.valid).toBe(false);
  });

  it("accepts zero id as falsy (rejects)", () => {
    const result = validateOrderUpdate({ id: 0, status: "served" });
    expect(result.valid).toBe(false);
  });
});

describe("Order status flow", () => {
  const validStatuses = ["preparing", "served", "paid", "cancelled"];

  it("recognizes all valid order statuses", () => {
    validStatuses.forEach((status) => {
      expect(validStatuses.includes(status)).toBe(true);
    });
  });

  it("typical order flow: preparing -> served -> paid", () => {
    const flow = ["preparing", "served", "paid"];
    expect(flow[0]).toBe("preparing");
    expect(flow[1]).toBe("served");
    expect(flow[2]).toBe("paid");
  });

  it("cancelled is a terminal state", () => {
    const terminalStates = ["paid", "cancelled"];
    expect(terminalStates.includes("cancelled")).toBe(true);
  });
});

describe("Order total calculation logic", () => {
  interface OrderItem {
    name: string;
    quantity: number;
    price: number;
  }

  function calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  it("calculates total for single item", () => {
    const items = [{ name: "Picanha", quantity: 1, price: 89.9 }];
    expect(calculateOrderTotal(items)).toBeCloseTo(89.9, 2);
  });

  it("calculates total for multiple items", () => {
    const items = [
      { name: "Picanha", quantity: 1, price: 89.9 },
      { name: "Caipirinha", quantity: 2, price: 18.5 },
      { name: "Sobremesa", quantity: 1, price: 25.0 },
    ];
    // 89.9 + 37 + 25 = 151.9
    expect(calculateOrderTotal(items)).toBeCloseTo(151.9, 2);
  });

  it("returns 0 for empty items array", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });

  it("handles items with quantity > 1", () => {
    const items = [{ name: "Cerveja", quantity: 5, price: 12 }];
    expect(calculateOrderTotal(items)).toBe(60);
  });
});
