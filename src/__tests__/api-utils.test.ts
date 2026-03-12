import { describe, it, expect } from "vitest";
import { ZodError, z } from "zod";

// Test the logic without importing NextResponse (not available in vitest/jsdom)
describe("API error handling logic", () => {
  it("ZodError produces meaningful messages", () => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
    });

    const result = schema.safeParse({ name: "A", email: "bad" });
    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      expect(messages).toHaveLength(2);
      expect(messages[0]).toContain("name");
      expect(messages[1]).toContain("email");
    }
  });

  it("ZodError is instance of Error", () => {
    try {
      z.string().parse(123);
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      expect(e).toBeInstanceOf(Error);
    }
  });
});
