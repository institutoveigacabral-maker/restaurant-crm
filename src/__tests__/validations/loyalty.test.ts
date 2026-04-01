import { describe, it, expect } from "vitest";
import {
  programCreateSchema,
  programUpdateSchema,
  transactionSchema,
} from "@/lib/validations/loyalty";

const validProgram = {
  name: "Programa Fidelidade Pateo",
  type: "points",
  rules: {
    pointsPerEuro: 2,
    tiers: [
      { name: "Bronze", minPoints: 0 },
      { name: "Silver", minPoints: 100 },
      { name: "Gold", minPoints: 500 },
    ],
  },
};

const validTransaction = {
  customerId: 1,
  points: 50,
  type: "earn" as const,
  description: "Compra no restaurante",
};

describe("programCreateSchema", () => {
  it("accepts valid program data", () => {
    const result = programCreateSchema.safeParse(validProgram);
    expect(result.success).toBe(true);
  });

  it("accepts minimal data with defaults", () => {
    const result = programCreateSchema.safeParse({ name: "Programa" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("points");
      expect(result.data.rules.pointsPerEuro).toBe(1);
      expect(result.data.rules.tiers).toEqual([]);
    }
  });

  it("rejects name shorter than 2 chars", () => {
    const result = programCreateSchema.safeParse({ ...validProgram, name: "P" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = programCreateSchema.safeParse({ ...validProgram, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 255 chars", () => {
    const result = programCreateSchema.safeParse({ ...validProgram, name: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects pointsPerEuro <= 0", () => {
    const result = programCreateSchema.safeParse({
      ...validProgram,
      rules: { ...validProgram.rules, pointsPerEuro: 0 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative pointsPerEuro", () => {
    const result = programCreateSchema.safeParse({
      ...validProgram,
      rules: { ...validProgram.rules, pointsPerEuro: -5 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects tier with empty name", () => {
    const result = programCreateSchema.safeParse({
      ...validProgram,
      rules: { pointsPerEuro: 1, tiers: [{ name: "", minPoints: 0 }] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects tier with negative minPoints", () => {
    const result = programCreateSchema.safeParse({
      ...validProgram,
      rules: { pointsPerEuro: 1, tiers: [{ name: "Bronze", minPoints: -1 }] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validProgram;
    const result = programCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("programUpdateSchema", () => {
  it("accepts partial update with just name", () => {
    const result = programUpdateSchema.safeParse({ name: "Novo nome" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with active flag", () => {
    const result = programUpdateSchema.safeParse({ active: false });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = programUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates constraints on provided fields", () => {
    const result = programUpdateSchema.safeParse({ name: "P" });
    expect(result.success).toBe(false);
  });
});

describe("transactionSchema", () => {
  it("accepts valid earn transaction", () => {
    const result = transactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
  });

  it("accepts valid redeem transaction", () => {
    const result = transactionSchema.safeParse({ ...validTransaction, type: "redeem" });
    expect(result.success).toBe(true);
  });

  it("rejects points <= 0", () => {
    const result = transactionSchema.safeParse({ ...validTransaction, points: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative points", () => {
    const result = transactionSchema.safeParse({ ...validTransaction, points: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = transactionSchema.safeParse({ ...validTransaction, type: "transfer" });
    expect(result.success).toBe(false);
  });

  it("rejects missing customerId", () => {
    const { customerId: _, ...rest } = validTransaction;
    const result = transactionSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects customerId <= 0", () => {
    const result = transactionSchema.safeParse({ ...validTransaction, customerId: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts description as optional with default", () => {
    const { description: _, ...rest } = validTransaction;
    const result = transactionSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });

  it("rejects description longer than 500 chars", () => {
    const result = transactionSchema.safeParse({
      ...validTransaction,
      description: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
