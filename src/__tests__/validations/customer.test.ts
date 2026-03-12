import { describe, it, expect } from "vitest";
import { customerSchema, customerUpdateSchema } from "@/lib/validations/customer";

describe("customerSchema", () => {
  it("accepts valid customer data", () => {
    const result = customerSchema.safeParse({
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-1234",
      notes: "VIP customer",
      tags: ["VIP", "Frequente"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal valid data", () => {
    const result = customerSchema.safeParse({
      name: "Jo",
      email: "j@e.com",
      phone: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = customerSchema.safeParse({
      name: "",
      email: "maria@email.com",
      phone: "(11) 99999-1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name with 1 character", () => {
    const result = customerSchema.safeParse({
      name: "A",
      email: "a@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "not-an-email",
      phone: "(11) 99999-1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short phone", () => {
    const result = customerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("defaults notes to empty string", () => {
    const result = customerSchema.parse({
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.notes).toBe("");
  });

  it("defaults tags to empty array", () => {
    const result = customerSchema.parse({
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.tags).toEqual([]);
  });
});

describe("customerUpdateSchema", () => {
  it("requires a positive id", () => {
    const result = customerUpdateSchema.safeParse({
      id: 1,
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects id = 0", () => {
    const result = customerUpdateSchema.safeParse({
      id: 0,
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string id to number", () => {
    const result = customerUpdateSchema.safeParse({
      id: "5",
      name: "Maria",
      email: "maria@email.com",
      phone: "12345678",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(5);
    }
  });
});
