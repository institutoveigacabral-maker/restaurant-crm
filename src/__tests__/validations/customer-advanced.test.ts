import { describe, it, expect } from "vitest";
import { customerSchema, customerUpdateSchema } from "@/lib/validations/customer";

describe("customerSchema — advanced edge cases", () => {
  it("rejects name longer than 255 characters", () => {
    const result = customerSchema.safeParse({
      name: "A".repeat(256),
      email: "test@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name of exactly 255 characters", () => {
    const result = customerSchema.safeParse({
      name: "A".repeat(255),
      email: "test@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("accepts name of exactly 2 characters (minimum)", () => {
    const result = customerSchema.safeParse({
      name: "Jo",
      email: "jo@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects notes longer than 1000 characters", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
      notes: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts notes of exactly 1000 characters", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
      notes: "x".repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects phone longer than 50 characters", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      phone: "1".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("accepts phone of exactly 50 characters", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      phone: "1".repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it("accepts array of tags", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
      tags: ["VIP", "Aniversariante", "Frequente"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toHaveLength(3);
    }
  });

  it("rejects non-string items in tags array", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
      tags: [123, true],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email field", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      phone: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing phone field", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("customerUpdateSchema — advanced", () => {
  it("rejects negative id", () => {
    const result = customerUpdateSchema.safeParse({
      id: -1,
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects NaN id", () => {
    const result = customerUpdateSchema.safeParse({
      id: "abc",
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("coerces float id to number", () => {
    const result = customerUpdateSchema.safeParse({
      id: "3.7",
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(3.7);
    }
  });
});
