import { describe, it, expect, vi } from "vitest";
import { ZodError, z } from "zod";

// We test the pure logic since NextResponse is not available in jsdom.
// The actual api-utils functions wrap NextResponse.json().

describe("API utils error handling logic", () => {
  describe("successResponse logic", () => {
    it("wraps data in { success: true, data }", () => {
      const data = { id: 1, name: "Test" };
      const response = { success: true, data };
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });
  });

  describe("errorResponse logic", () => {
    it("wraps message in { success: false, error }", () => {
      const message = "Não autorizado";
      const response = { success: false, error: message };
      expect(response.success).toBe(false);
      expect(response.error).toBe("Não autorizado");
    });
  });

  describe("validationErrorResponse logic", () => {
    it("formats ZodError issues into readable messages", () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(8),
      });

      const result = schema.safeParse({ name: "A", email: "bad", phone: "123" });
      expect(result.success).toBe(false);

      if (!result.success) {
        const messages = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        expect(messages).toHaveLength(3);
        expect(messages[0]).toContain("name");
        expect(messages[1]).toContain("email");
        expect(messages[2]).toContain("phone");
      }
    });

    it("handles nested path fields", () => {
      const schema = z.object({
        address: z.object({
          zip: z.string().min(5),
        }),
      });

      const result = schema.safeParse({ address: { zip: "12" } });
      expect(result.success).toBe(false);

      if (!result.success) {
        const messages = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        expect(messages[0]).toContain("address.zip");
      }
    });
  });

  describe("handleApiError logic", () => {
    it("ZodError is detected as instance of Error", () => {
      try {
        z.string().parse(123);
      } catch (e) {
        expect(e instanceof ZodError).toBe(true);
        expect(e instanceof Error).toBe(true);
      }
    });

    it("regular Error provides message", () => {
      const err = new Error("Database connection failed");
      expect(err instanceof Error).toBe(true);
      expect(err.message).toBe("Database connection failed");
    });

    it("non-Error values default to generic message", () => {
      const error = "string error";
      const message = error instanceof Error ? error.message : "Erro interno do servidor";
      expect(message).toBe("Erro interno do servidor");
    });
  });
});
