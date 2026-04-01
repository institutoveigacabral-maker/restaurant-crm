import { describe, it, expect } from "vitest";
import {
  checklistCreateSchema,
  checklistUpdateSchema,
  progressUpdateSchema,
} from "@/lib/validations/onboarding";

const validChecklist = {
  title: "Onboarding Cozinha",
  items: [
    { text: "Conhecer equipa", description: "Apresentacao formal" },
    { text: "Ler manual de higiene" },
    { text: "Tour pelo restaurante" },
  ],
  role: "staff" as const,
};

describe("checklistCreateSchema", () => {
  it("accepts valid checklist data", () => {
    const result = checklistCreateSchema.safeParse(validChecklist);
    expect(result.success).toBe(true);
  });

  it("accepts minimal data with default role", () => {
    const result = checklistCreateSchema.safeParse({
      title: "Checklist",
      items: [{ text: "Item 1" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("all");
    }
  });

  it("rejects title shorter than 3 chars", () => {
    const result = checklistCreateSchema.safeParse({ ...validChecklist, title: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = checklistCreateSchema.safeParse({ ...validChecklist, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 255 chars", () => {
    const result = checklistCreateSchema.safeParse({ ...validChecklist, title: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects empty items array", () => {
    const result = checklistCreateSchema.safeParse({ ...validChecklist, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects item with empty text", () => {
    const result = checklistCreateSchema.safeParse({
      ...validChecklist,
      items: [{ text: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid roles", () => {
    for (const role of ["manager", "staff", "all"]) {
      const result = checklistCreateSchema.safeParse({ ...validChecklist, role });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid role", () => {
    const result = checklistCreateSchema.safeParse({ ...validChecklist, role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validChecklist;
    const result = checklistCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validChecklist;
    const result = checklistCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts item with optional description", () => {
    const result = checklistCreateSchema.safeParse({
      ...validChecklist,
      items: [{ text: "Item sem descricao" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("checklistUpdateSchema", () => {
  it("accepts partial update with just title", () => {
    const result = checklistUpdateSchema.safeParse({ title: "Novo titulo" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with just role", () => {
    const result = checklistUpdateSchema.safeParse({ role: "manager" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = checklistUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates constraints on provided fields", () => {
    const result = checklistUpdateSchema.safeParse({ title: "ab" });
    expect(result.success).toBe(false);
  });

  it("still rejects empty items when provided", () => {
    const result = checklistUpdateSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });
});

describe("progressUpdateSchema", () => {
  it("accepts array of completed item indices", () => {
    const result = progressUpdateSchema.safeParse({ completedItems: [0, 1, 2] });
    expect(result.success).toBe(true);
  });

  it("accepts empty array", () => {
    const result = progressUpdateSchema.safeParse({ completedItems: [] });
    expect(result.success).toBe(true);
  });

  it("rejects negative indices", () => {
    const result = progressUpdateSchema.safeParse({ completedItems: [-1] });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer indices", () => {
    const result = progressUpdateSchema.safeParse({ completedItems: [1.5] });
    expect(result.success).toBe(false);
  });

  it("rejects missing completedItems", () => {
    const result = progressUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
