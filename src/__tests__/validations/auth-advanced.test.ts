import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("loginSchema — advanced edge cases", () => {
  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "admin123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "admin@test.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 6 character password", () => {
    const result = loginSchema.safeParse({
      email: "admin@test.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects 5 character password", () => {
    const result = loginSchema.safeParse({
      email: "admin@test.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0].message;
      expect(msg).toContain("6 caracteres");
    }
  });

  it("rejects email without domain", () => {
    const result = loginSchema.safeParse({
      email: "admin@",
      password: "admin123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email without @", () => {
    const result = loginSchema.safeParse({
      email: "adminemail.com",
      password: "admin123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts long valid password", () => {
    const result = loginSchema.safeParse({
      email: "admin@test.com",
      password: "a".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields entirely", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("registerSchema — advanced edge cases", () => {
  it("rejects empty confirmPassword", () => {
    const result = registerSchema.safeParse({
      name: "Joao",
      email: "joao@email.com",
      password: "senha123",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("returns correct error message for mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Joao",
      email: "joao@email.com",
      password: "senha123",
      confirmPassword: "outra456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes("confirmPassword"));
      expect(confirmError).toBeDefined();
      expect(confirmError!.message).toBe("Senhas não conferem");
    }
  });

  it("accepts exactly 2 character name", () => {
    const result = registerSchema.safeParse({
      name: "Jo",
      email: "jo@email.com",
      password: "senha123",
      confirmPassword: "senha123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects 1 character name with correct error message", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "jo@email.com",
      password: "senha123",
      confirmPassword: "senha123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameError).toBeDefined();
      expect(nameError!.message).toContain("2 caracteres");
    }
  });

  it("validates email format in registration", () => {
    const result = registerSchema.safeParse({
      name: "Joao",
      email: "not-valid",
      password: "senha123",
      confirmPassword: "senha123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes("email"));
      expect(emailError).toBeDefined();
    }
  });

  it("accepts valid registration with all fields", () => {
    const result = registerSchema.safeParse({
      name: "Maria Souza",
      email: "maria.souza@restaurant.com.br",
      password: "senha_segura_123",
      confirmPassword: "senha_segura_123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Maria Souza");
      expect(result.data.email).toBe("maria.souza@restaurant.com.br");
    }
  });
});
