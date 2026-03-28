import { describe, it, expect } from "vitest";
import { sopCreateSchema, sopUpdateSchema } from "@/lib/validations/sop";

const validSop = {
  title: "Checklist de Abertura - Salao",
  category: "salao",
  content: "# Checklist\n\n- [ ] Verificar limpeza\n- [ ] Ligar AC",
  status: "draft" as const,
};

describe("sopCreateSchema", () => {
  it("accepts valid SOP data", () => {
    const result = sopCreateSchema.safeParse(validSop);
    expect(result.success).toBe(true);
  });

  it("accepts minimal data with default status", () => {
    const result = sopCreateSchema.safeParse({
      title: "SOP",
      category: "rh",
      content: "Conteudo",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });

  it("rejects title shorter than 3 chars", () => {
    const result = sopCreateSchema.safeParse({ ...validSop, title: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = sopCreateSchema.safeParse({ ...validSop, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 255 chars", () => {
    const result = sopCreateSchema.safeParse({ ...validSop, title: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects empty category", () => {
    const result = sopCreateSchema.safeParse({ ...validSop, category: "" });
    expect(result.success).toBe(false);
  });

  it("rejects category longer than 100 chars", () => {
    const result = sopCreateSchema.safeParse({ ...validSop, category: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = sopCreateSchema.safeParse({ ...validSop, content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = sopCreateSchema.safeParse({ ...validSop, status: "archived" });
    expect(result.success).toBe(false);
  });

  it("accepts both valid statuses", () => {
    for (const status of ["draft", "published"]) {
      const result = sopCreateSchema.safeParse({ ...validSop, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validSop;
    const result = sopCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing category", () => {
    const { category: _, ...rest } = validSop;
    const result = sopCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const { content: _, ...rest } = validSop;
    const result = sopCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("sopUpdateSchema", () => {
  it("accepts partial update with just title", () => {
    const result = sopUpdateSchema.safeParse({ title: "Novo titulo" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with just status", () => {
    const result = sopUpdateSchema.safeParse({ status: "published" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with just content", () => {
    const result = sopUpdateSchema.safeParse({ content: "Novo conteudo" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = sopUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates constraints on provided fields", () => {
    const result = sopUpdateSchema.safeParse({ title: "ab" });
    expect(result.success).toBe(false);
  });

  it("still rejects empty content when provided", () => {
    const result = sopUpdateSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });
});
