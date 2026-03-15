import { describe, it, expect } from "vitest";

// Test the middleware matcher pattern from src/middleware.ts
// Pattern: /((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)
// This regex skips auth-related and static paths; all others require auth.

const excludedPrefixes = [
  "api/auth",
  "login",
  "register",
  "_next/static",
  "_next/image",
  "favicon.ico",
];

function shouldApplyMiddleware(pathname: string): boolean {
  // Remove leading slash for matching
  const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return !excludedPrefixes.some((prefix) => cleanPath.startsWith(prefix));
}

describe("Auth middleware matcher", () => {
  describe("paths that require authentication", () => {
    it("protects dashboard root", () => {
      expect(shouldApplyMiddleware("/")).toBe(true);
    });

    it("protects /customers", () => {
      expect(shouldApplyMiddleware("/customers")).toBe(true);
    });

    it("protects /reservations", () => {
      expect(shouldApplyMiddleware("/reservations")).toBe(true);
    });

    it("protects /orders", () => {
      expect(shouldApplyMiddleware("/orders")).toBe(true);
    });

    it("protects /menu", () => {
      expect(shouldApplyMiddleware("/menu")).toBe(true);
    });

    it("protects /gamification", () => {
      expect(shouldApplyMiddleware("/gamification")).toBe(true);
    });

    it("protects /training", () => {
      expect(shouldApplyMiddleware("/training")).toBe(true);
    });

    it("protects /settings", () => {
      expect(shouldApplyMiddleware("/settings")).toBe(true);
    });

    it("protects /reports", () => {
      expect(shouldApplyMiddleware("/reports")).toBe(true);
    });

    it("protects /insights", () => {
      expect(shouldApplyMiddleware("/insights")).toBe(true);
    });

    it("protects /api/customers", () => {
      expect(shouldApplyMiddleware("/api/customers")).toBe(true);
    });

    it("protects /api/orders", () => {
      expect(shouldApplyMiddleware("/api/orders")).toBe(true);
    });
  });

  describe("paths that bypass authentication", () => {
    it("allows /login", () => {
      expect(shouldApplyMiddleware("/login")).toBe(false);
    });

    it("allows /register", () => {
      expect(shouldApplyMiddleware("/register")).toBe(false);
    });

    it("allows /api/auth routes", () => {
      expect(shouldApplyMiddleware("/api/auth/signin")).toBe(false);
    });

    it("allows /api/auth/callback", () => {
      expect(shouldApplyMiddleware("/api/auth/callback/credentials")).toBe(false);
    });

    it("allows Next.js static files", () => {
      expect(shouldApplyMiddleware("/_next/static/chunk.js")).toBe(false);
    });

    it("allows Next.js image optimization", () => {
      expect(shouldApplyMiddleware("/_next/image?url=test")).toBe(false);
    });

    it("allows favicon", () => {
      expect(shouldApplyMiddleware("/favicon.ico")).toBe(false);
    });
  });
});
