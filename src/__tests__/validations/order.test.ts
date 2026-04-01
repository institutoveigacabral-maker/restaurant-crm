import { describe, it, expect } from "vitest";
import { orderCreateSchema } from "@/lib/validations/order";

const validOrder = {
  customerName: "Joao Silva",
  items: [
    { name: "Bacalhau a Bras", quantity: 2, price: 18.5 },
    { name: "Vinho Tinto", quantity: 1, price: 12.0 },
  ],
  total: 49.0,
  status: "pending" as const,
};

describe("orderCreateSchema", () => {
  it("accepts valid order data", () => {
    const result = orderCreateSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("accepts minimal data with default status", () => {
    const result = orderCreateSchema.safeParse({
      customerName: "Maria",
      items: [{ name: "Cafe", quantity: 1, price: 1.5 }],
      total: 1.5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("pending");
    }
  });

  it("rejects negative total", () => {
    const result = orderCreateSchema.safeParse({ ...validOrder, total: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts total of zero", () => {
    const result = orderCreateSchema.safeParse({ ...validOrder, total: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects empty items array", () => {
    const result = orderCreateSchema.safeParse({ ...validOrder, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects item with quantity < 1", () => {
    const result = orderCreateSchema.safeParse({
      ...validOrder,
      items: [{ name: "Cafe", quantity: 0, price: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects item with negative price", () => {
    const result = orderCreateSchema.safeParse({
      ...validOrder,
      items: [{ name: "Cafe", quantity: 1, price: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts item with price of zero", () => {
    const result = orderCreateSchema.safeParse({
      ...validOrder,
      items: [{ name: "Agua", quantity: 1, price: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects item with empty name", () => {
    const result = orderCreateSchema.safeParse({
      ...validOrder,
      items: [{ name: "", quantity: 1, price: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty customerName", () => {
    const result = orderCreateSchema.safeParse({ ...validOrder, customerName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing customerName", () => {
    const { customerName: _, ...rest } = validOrder;
    const result = orderCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validOrder;
    const result = orderCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validOrder;
    const result = orderCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["pending", "preparing", "served", "paid", "cancelled"]) {
      const result = orderCreateSchema.safeParse({ ...validOrder, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = orderCreateSchema.safeParse({ ...validOrder, status: "delivered" });
    expect(result.success).toBe(false);
  });

  it("accepts optional customerId", () => {
    const result = orderCreateSchema.safeParse({ ...validOrder, customerId: 42 });
    expect(result.success).toBe(true);
  });

  it("accepts optional date", () => {
    const result = orderCreateSchema.safeParse({ ...validOrder, date: "2026-03-27" });
    expect(result.success).toBe(true);
  });
});
