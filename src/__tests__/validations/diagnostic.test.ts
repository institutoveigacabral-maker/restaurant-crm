import { describe, it, expect } from "vitest";
import { diagnosticCreateSchema, diagnosticUpdateSchema } from "@/lib/validations/diagnostic";

const validDiagnostic = {
  title: "Diagnostico Pateo do Petisco",
  answers: {
    ferramentas: [2, 1, 3, 2],
    dados: [1, 2, 1, 0],
    processos: [0, 1, 1, 0],
    cultura: [2, 1, 2, 1],
    automacao: [0, 1, 0, 0],
    presenca: [3, 2, 1, 2],
  },
  scores: {
    ferramentas: 8,
    dados: 4,
    processos: 2,
    cultura: 6,
    automacao: 1,
    presenca: 8,
  },
  overallScore: 29,
  status: "completed" as const,
};

describe("diagnosticCreateSchema", () => {
  it("accepts valid diagnostic data", () => {
    const result = diagnosticCreateSchema.safeParse(validDiagnostic);
    expect(result.success).toBe(true);
  });

  it("accepts minimal data with default status", () => {
    const result = diagnosticCreateSchema.safeParse({
      title: "Test",
      answers: { section: [1, 2] },
      scores: { section: 3 },
      overallScore: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });

  it("rejects title shorter than 3 chars", () => {
    const result = diagnosticCreateSchema.safeParse({ ...validDiagnostic, title: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = diagnosticCreateSchema.safeParse({ ...validDiagnostic, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 255 chars", () => {
    const result = diagnosticCreateSchema.safeParse({ ...validDiagnostic, title: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects answer values outside 0-3", () => {
    const result = diagnosticCreateSchema.safeParse({
      ...validDiagnostic,
      answers: { section: [4] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative answer values", () => {
    const result = diagnosticCreateSchema.safeParse({
      ...validDiagnostic,
      answers: { section: [-1] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects score values above 12", () => {
    const result = diagnosticCreateSchema.safeParse({
      ...validDiagnostic,
      scores: { section: 13 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects overallScore above 72", () => {
    const result = diagnosticCreateSchema.safeParse({ ...validDiagnostic, overallScore: 73 });
    expect(result.success).toBe(false);
  });

  it("rejects negative overallScore", () => {
    const result = diagnosticCreateSchema.safeParse({ ...validDiagnostic, overallScore: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = diagnosticCreateSchema.safeParse({ ...validDiagnostic, status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["draft", "in_progress", "completed"]) {
      const result = diagnosticCreateSchema.safeParse({ ...validDiagnostic, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing answers", () => {
    const { answers: _, ...rest } = validDiagnostic;
    const result = diagnosticCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing scores", () => {
    const { scores: _, ...rest } = validDiagnostic;
    const result = diagnosticCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing overallScore", () => {
    const { overallScore: _, ...rest } = validDiagnostic;
    const result = diagnosticCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("diagnosticUpdateSchema", () => {
  it("accepts partial update with just title", () => {
    const result = diagnosticUpdateSchema.safeParse({ title: "Novo titulo" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with just status", () => {
    const result = diagnosticUpdateSchema.safeParse({ status: "completed" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = diagnosticUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates constraints on provided fields", () => {
    const result = diagnosticUpdateSchema.safeParse({ title: "ab" });
    expect(result.success).toBe(false);
  });

  it("still validates overallScore range", () => {
    const result = diagnosticUpdateSchema.safeParse({ overallScore: 100 });
    expect(result.success).toBe(false);
  });
});
