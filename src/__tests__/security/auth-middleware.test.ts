import { describe, it, expect, vi } from "vitest";

// Mock auth para evitar import de next-auth/next/server
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

import { config } from "@/middleware";

/**
 * Auth Middleware - Matcher Configuration
 *
 * Verifica que o middleware de auth protege as rotas corretas.
 * Rotas publicas (excluidas do matcher): api/auth, api/health, login, register.
 * Rotas protegidas: tudo o resto (/, api/customers, etc).
 */
describe("Auth Middleware - Matcher Config", () => {
  const matcher = config.matcher[0];

  // Helper: testa se uma rota e capturada pelo matcher (protegida)
  function isProtected(path: string): boolean {
    // O matcher e um negative lookahead regex no Next.js
    // /((?!api/auth|api/health|login|register|_next/static|_next/image|favicon.ico).*)
    const regexStr = matcher.replace(/^\/(.*)\/?$/, "$1");
    const regex = new RegExp(`^${regexStr}$`);
    // Next.js testa o pathname sem a leading slash no grupo
    const pathWithoutSlash = path.startsWith("/") ? path.slice(1) : path;
    return regex.test(pathWithoutSlash);
  }

  describe("rotas publicas (nao protegidas pelo middleware)", () => {
    it("api/auth esta excluida do matcher", () => {
      expect(isProtected("/api/auth")).toBe(false);
      expect(isProtected("/api/auth/callback/credentials")).toBe(false);
    });

    it("api/health esta excluida do matcher", () => {
      expect(isProtected("/api/health")).toBe(false);
    });

    it("login esta excluida do matcher", () => {
      expect(isProtected("/login")).toBe(false);
    });

    it("register esta excluida do matcher", () => {
      expect(isProtected("/register")).toBe(false);
    });

    it("_next/static esta excluida do matcher", () => {
      expect(isProtected("/_next/static/chunk.js")).toBe(false);
    });

    it("favicon.ico esta excluido do matcher", () => {
      expect(isProtected("/favicon.ico")).toBe(false);
    });
  });

  describe("rotas protegidas (capturadas pelo middleware)", () => {
    it("/ (root) e protegida", () => {
      expect(isProtected("/")).toBe(true);
    });

    it("api/customers e protegida", () => {
      expect(isProtected("/api/customers")).toBe(true);
    });

    it("api/orders e protegida", () => {
      expect(isProtected("/api/orders")).toBe(true);
    });

    it("api/sops e protegida", () => {
      expect(isProtected("/api/sops")).toBe(true);
    });

    it("api/diagnostics e protegida", () => {
      expect(isProtected("/api/diagnostics")).toBe(true);
    });

    it("api/chat e protegida", () => {
      expect(isProtected("/api/chat")).toBe(true);
    });

    it("dashboard e protegida", () => {
      expect(isProtected("/dashboard")).toBe(true);
    });

    it("settings e protegida", () => {
      expect(isProtected("/settings")).toBe(true);
    });
  });

  describe("matcher structure", () => {
    it("matcher e um array com exatamente 1 pattern", () => {
      expect(config.matcher).toHaveLength(1);
    });

    it("matcher contem negative lookahead para rotas publicas", () => {
      expect(matcher).toContain("api/auth");
      expect(matcher).toContain("api/health");
      expect(matcher).toContain("login");
      expect(matcher).toContain("register");
    });
  });
});
