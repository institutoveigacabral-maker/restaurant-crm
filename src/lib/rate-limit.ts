/**
 * Rate limiter in-memory usando Map.
 * Adequado para dev e single-instance.
 * Para producao multi-instance, substituir por Redis.
 */

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface TokenRecord {
  count: number;
  expiresAt: number;
}

export class RateLimitError extends Error {
  status: number;

  constructor(message = "Limite de requisições excedido") {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
  }
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;
  const tokenMap = new Map<string, TokenRecord>();

  // Limpeza periodica — remove tokens expirados
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of tokenMap) {
      if (record.expiresAt <= now) {
        tokenMap.delete(key);
      }
    }
    // Evita que o Map cresca indefinidamente
    if (tokenMap.size > uniqueTokenPerInterval) {
      const excess = tokenMap.size - uniqueTokenPerInterval;
      const keys = tokenMap.keys();
      for (let i = 0; i < excess; i++) {
        const { value } = keys.next();
        if (value) tokenMap.delete(value);
      }
    }
  }, interval);

  // Nao bloqueia o shutdown do processo
  if (cleanup.unref) {
    cleanup.unref();
  }

  return {
    check(limit: number, token: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const now = Date.now();
        const record = tokenMap.get(token);

        if (!record || record.expiresAt <= now) {
          tokenMap.set(token, { count: 1, expiresAt: now + interval });
          return resolve();
        }

        if (record.count >= limit) {
          return reject(new RateLimitError());
        }

        record.count++;
        resolve();
      });
    },
  };
}

// Instancia default: 60 requests por minuto, ate 500 IPs unicos
export const defaultRateLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});
