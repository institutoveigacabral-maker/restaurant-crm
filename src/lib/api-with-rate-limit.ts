import { NextRequest, NextResponse } from "next/server";

import { defaultRateLimiter, RateLimitError, rateLimit } from "./rate-limit";

interface RateLimitWrapperOptions {
  limit?: number;
  interval?: number;
  uniqueTokenPerInterval?: number;
}

type ApiHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse> | NextResponse;

function extractIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Wrapper que aplica rate limit antes de chamar o handler.
 * Extrai IP do request como token de identificacao.
 *
 * Uso:
 *   export const GET = withRateLimit(async (req) => { ... });
 *   export const POST = withRateLimit(handler, { limit: 10 });
 */
export function withRateLimit(handler: ApiHandler, options?: RateLimitWrapperOptions): ApiHandler {
  const limit = options?.limit ?? 60;

  // Usa limiter customizado se interval ou uniqueTokenPerInterval forem passados
  const limiter =
    options?.interval || options?.uniqueTokenPerInterval
      ? rateLimit({
          interval: options?.interval ?? 60_000,
          uniqueTokenPerInterval: options?.uniqueTokenPerInterval ?? 500,
        })
      : defaultRateLimiter;

  return async (request: NextRequest, context?: unknown) => {
    const ip = extractIp(request);

    try {
      await limiter.check(limit, ip);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return NextResponse.json(
          {
            success: false,
            error: "Limite de requisições excedido. Tente novamente em breve.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((options?.interval ?? 60_000) / 1000)),
            },
          }
        );
      }
      throw error;
    }

    return handler(request, context);
  };
}
