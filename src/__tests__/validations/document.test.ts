import { describe, it, expect } from "vitest";
import { documentCreateSchema, documentUpdateSchema } from "@/lib/validations/document";

const validDocument = {
  name: "Manual de Operacoes",
  type: "manual" as const,
};

describe("documentCreateSchema", () => {
  it("accepts valid document data", () => {
    const result = documentCreateSchema.safeParse(validDocument);
    expect(result.success).toBe(true);
  });

  it("accepts all valid types", () => {
    for (const type of ["manual", "template", "policy", "checklist", "other"]) {
      const result = documentCreateSchema.safeParse({ ...validDocument, type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects name shorter than 3 chars", () => {
    const result = documentCreateSchema.safeParse({ ...validDocument, name: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = documentCreateSchema.safeParse({ ...validDocument, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 255 chars", () => {
    const result = documentCreateSchema.safeParse({ ...validDocument, name: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = documentCreateSchema.safeParse({ ...validDocument, type: "report" });
    expect(result.success).toBe(false);
  });

  it("accepts url as optional", () => {
    const result = documentCreateSchema.safeParse({
      ...validDocument,
      url: "https://example.com/doc.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts without url", () => {
    const result = documentCreateSchema.safeParse(validDocument);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBeUndefined();
    }
  });

  it("accepts metadata as optional", () => {
    const result = documentCreateSchema.safeParse({
      ...validDocument,
      metadata: { author: "Henrique", pages: 42 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts without metadata", () => {
    const result = documentCreateSchema.safeParse(validDocument);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata).toBeUndefined();
    }
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validDocument;
    const result = documentCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validDocument;
    const result = documentCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("documentUpdateSchema", () => {
  it("accepts partial update with just name", () => {
    const result = documentUpdateSchema.safeParse({ name: "Novo nome" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with just type", () => {
    const result = documentUpdateSchema.safeParse({ type: "policy" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = documentUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates constraints on provided fields", () => {
    const result = documentUpdateSchema.safeParse({ name: "ab" });
    expect(result.success).toBe(false);
  });

  it("still rejects invalid type when provided", () => {
    const result = documentUpdateSchema.safeParse({ type: "report" });
    expect(result.success).toBe(false);
  });
});
