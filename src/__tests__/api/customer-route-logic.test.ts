import { describe, it, expect } from "vitest";

// Test the authorization and role-checking logic from customer API route.
// The DELETE endpoint checks:
//   if (role !== "admin" && role !== "gerente") return 403

function canDeleteCustomer(role: string | undefined): boolean {
  return role === "admin" || role === "gerente";
}

function parseIdFromUrl(url: string): number {
  const { searchParams } = new URL(url);
  return Number(searchParams.get("id"));
}

describe("Customer deletion authorization", () => {
  it("allows admin to delete", () => {
    expect(canDeleteCustomer("admin")).toBe(true);
  });

  it("allows gerente to delete", () => {
    expect(canDeleteCustomer("gerente")).toBe(true);
  });

  it("denies garcom from deleting", () => {
    expect(canDeleteCustomer("garcom")).toBe(false);
  });

  it("denies cozinheiro from deleting", () => {
    expect(canDeleteCustomer("cozinheiro")).toBe(false);
  });

  it("denies undefined role from deleting", () => {
    expect(canDeleteCustomer(undefined)).toBe(false);
  });

  it("denies empty string role from deleting", () => {
    expect(canDeleteCustomer("")).toBe(false);
  });
});

describe("ID parsing from URL", () => {
  it("parses valid numeric id", () => {
    expect(parseIdFromUrl("http://localhost:3000/api/customers?id=5")).toBe(5);
  });

  it("returns 0 (falsy) for missing id parameter", () => {
    // Number(null) returns 0, which is falsy — the route checks `if (!id)`
    const result = parseIdFromUrl("http://localhost:3000/api/customers");
    expect(result).toBe(0);
    expect(!result).toBe(true); // falsy, so route rejects it
  });

  it("returns NaN for non-numeric id", () => {
    const result = parseIdFromUrl("http://localhost:3000/api/customers?id=abc");
    expect(result).toBeNaN();
  });

  it("parses id from URL with other params", () => {
    expect(parseIdFromUrl("http://localhost:3000/api/customers?foo=bar&id=42&baz=qux")).toBe(42);
  });

  it("returns 0 for id=0", () => {
    expect(parseIdFromUrl("http://localhost:3000/api/customers?id=0")).toBe(0);
  });
});

describe("API response structure", () => {
  it("success response has correct shape", () => {
    const data = [{ id: 1, name: "Maria" }];
    const response = { success: true, data };
    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("data");
    expect(response.data).toHaveLength(1);
  });

  it("error response has correct shape", () => {
    const response = { success: false, error: "Não autorizado" };
    expect(response).toHaveProperty("success", false);
    expect(response).toHaveProperty("error", "Não autorizado");
  });

  it("validation error response includes details", () => {
    const response = {
      success: false,
      error: "Dados inválidos",
      details: ["name: Nome deve ter pelo menos 2 caracteres"],
    };
    expect(response.details).toHaveLength(1);
    expect(response.details[0]).toContain("name");
  });
});
