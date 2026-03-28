import { describe, it, expect } from "vitest";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
    await expect(limiter.check(5, "ip-1")).resolves.toBeUndefined();
    await expect(limiter.check(5, "ip-1")).resolves.toBeUndefined();
    await expect(limiter.check(5, "ip-1")).resolves.toBeUndefined();
  });

  it("rejects requests exceeding limit", async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
    const token = "ip-reject";

    // Fill up to limit
    for (let i = 0; i < 3; i++) {
      await limiter.check(3, token);
    }

    // Next should fail
    await expect(limiter.check(3, token)).rejects.toThrow(RateLimitError);
  });

  it("tracks different tokens independently", async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });

    // Fill token A to limit
    for (let i = 0; i < 2; i++) {
      await limiter.check(2, "token-a");
    }

    // Token B should still work
    await expect(limiter.check(2, "token-b")).resolves.toBeUndefined();

    // Token A should fail
    await expect(limiter.check(2, "token-a")).rejects.toThrow(RateLimitError);
  });

  it("RateLimitError has status 429", async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });

    await limiter.check(1, "ip-429");

    try {
      await limiter.check(1, "ip-429");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(RateLimitError);
      expect((e as RateLimitError).status).toBe(429);
    }
  });

  it("resets after interval", async () => {
    const limiter = rateLimit({ interval: 50, uniqueTokenPerInterval: 100 });

    await limiter.check(1, "ip-reset");
    await expect(limiter.check(1, "ip-reset")).rejects.toThrow(RateLimitError);

    // Wait for interval to pass
    await new Promise((r) => setTimeout(r, 60));

    // Should work again
    await expect(limiter.check(1, "ip-reset")).resolves.toBeUndefined();
  });
});
