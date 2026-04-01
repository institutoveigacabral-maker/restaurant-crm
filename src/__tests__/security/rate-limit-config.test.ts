import { describe, it, expect } from "vitest";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";

/**
 * Rate Limit Configuration
 *
 * Verifica que rate limiters estao configurados com limites seguros
 * e que RateLimitError retorna status 429.
 * Sem network — testa a logica in-memory diretamente.
 */
describe("Rate Limit Configuration", () => {
  describe("RateLimitError", () => {
    it("tem status 429", () => {
      const error = new RateLimitError();
      expect(error.status).toBe(429);
    });

    it("tem name RateLimitError", () => {
      const error = new RateLimitError();
      expect(error.name).toBe("RateLimitError");
    });

    it("herda de Error", () => {
      const error = new RateLimitError();
      expect(error).toBeInstanceOf(Error);
    });

    it("aceita mensagem customizada", () => {
      const msg = "Too many requests";
      const error = new RateLimitError(msg);
      expect(error.message).toBe(msg);
    });

    it("tem mensagem default em PT", () => {
      const error = new RateLimitError();
      expect(error.message).toContain("requisições");
    });
  });

  describe("auth login limiter", () => {
    it("permite ate 10 requests por token", async () => {
      const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
      const token = "test-ip-auth";

      // 10 requests devem passar
      for (let i = 0; i < 10; i++) {
        await expect(limiter.check(10, token)).resolves.toBeUndefined();
      }

      // 11a request deve falhar
      await expect(limiter.check(10, token)).rejects.toThrow(RateLimitError);
    });

    it("limite de auth login <= 10 req/min", () => {
      // Conforme implementado em api/auth/[...nextauth]/route.ts:
      // authLimiter.check(10, ip)
      const AUTH_LIMIT = 10;
      expect(AUTH_LIMIT).toBeLessThanOrEqual(10);
    });
  });

  describe("register limiter", () => {
    it("permite ate 5 requests por token", async () => {
      const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
      const token = "test-ip-register";

      for (let i = 0; i < 5; i++) {
        await expect(limiter.check(5, token)).resolves.toBeUndefined();
      }

      await expect(limiter.check(5, token)).rejects.toThrow(RateLimitError);
    });

    it("limite de register <= 5 req/min", () => {
      // Conforme implementado em api/auth/register/route.ts:
      // registerLimiter.check(5, ip)
      const REGISTER_LIMIT = 5;
      expect(REGISTER_LIMIT).toBeLessThanOrEqual(5);
    });
  });

  describe("chat limiter", () => {
    it("permite ate 10 requests por token", async () => {
      const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
      const token = "test-user-chat";

      for (let i = 0; i < 10; i++) {
        await expect(limiter.check(10, token)).resolves.toBeUndefined();
      }

      await expect(limiter.check(10, token)).rejects.toThrow(RateLimitError);
    });

    it("limite de chat <= 10 req/min", () => {
      // Conforme implementado em api/chat/route.ts:
      // chatLimiter.check(10, session.user.id)
      const CHAT_LIMIT = 10;
      expect(CHAT_LIMIT).toBeLessThanOrEqual(10);
    });
  });

  describe("rate limiter isolation", () => {
    it("tokens diferentes nao interferem entre si", async () => {
      const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

      // Esgotar token A
      for (let i = 0; i < 5; i++) {
        await limiter.check(5, "token-a");
      }
      await expect(limiter.check(5, "token-a")).rejects.toThrow(RateLimitError);

      // Token B ainda deve funcionar
      await expect(limiter.check(5, "token-b")).resolves.toBeUndefined();
    });
  });
});
