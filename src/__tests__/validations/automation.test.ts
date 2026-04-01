import { describe, it, expect } from "vitest";
import {
  automationCreateSchema,
  automationUpdateSchema,
  AUTOMATION_TYPES,
} from "@/lib/validations/automation";

const validAutomation = {
  name: "Confirmacao de Reserva",
  type: "reservation_confirmed" as const,
  active: true,
};

describe("automationCreateSchema", () => {
  it("accepts valid automation data", () => {
    const result = automationCreateSchema.safeParse(validAutomation);
    expect(result.success).toBe(true);
  });

  it("accepts minimal data with default active", () => {
    const result = automationCreateSchema.safeParse({
      name: "Test Automation",
      type: "customer_welcome",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active).toBe(true);
    }
  });

  it("rejects name shorter than 3 chars", () => {
    const result = automationCreateSchema.safeParse({ ...validAutomation, name: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = automationCreateSchema.safeParse({ ...validAutomation, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 255 chars", () => {
    const result = automationCreateSchema.safeParse({ ...validAutomation, name: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = automationCreateSchema.safeParse({ ...validAutomation, type: "invalid_type" });
    expect(result.success).toBe(false);
  });

  it("accepts all 5 valid types", () => {
    for (const type of AUTOMATION_TYPES) {
      const result = automationCreateSchema.safeParse({ ...validAutomation, type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validAutomation;
    const result = automationCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validAutomation;
    const result = automationCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts active as false", () => {
    const result = automationCreateSchema.safeParse({ ...validAutomation, active: false });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active).toBe(false);
    }
  });
});

describe("automationUpdateSchema", () => {
  it("accepts partial update with just name", () => {
    const result = automationUpdateSchema.safeParse({ name: "Novo nome" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with just type", () => {
    const result = automationUpdateSchema.safeParse({ type: "customer_inactive" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with just active", () => {
    const result = automationUpdateSchema.safeParse({ active: false });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = automationUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates constraints on provided fields", () => {
    const result = automationUpdateSchema.safeParse({ name: "ab" });
    expect(result.success).toBe(false);
  });

  it("still rejects invalid type when provided", () => {
    const result = automationUpdateSchema.safeParse({ type: "nao_existe" });
    expect(result.success).toBe(false);
  });
});
