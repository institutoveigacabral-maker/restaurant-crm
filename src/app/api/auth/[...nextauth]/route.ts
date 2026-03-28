import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";

const authLimiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

export const { GET } = handlers;

export async function POST(req: NextRequest) {
  // Rate limit only credential login attempts (callback/credentials)
  if (req.nextUrl.pathname.includes("callback/credentials")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    try {
      await authLimiter.check(10, ip);
    } catch (e) {
      if (e instanceof RateLimitError) {
        return NextResponse.json(
          { error: "Demasiadas tentativas de login. Tente novamente em 1 minuto." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
      throw e;
    }
  }

  return handlers.POST(req);
}
