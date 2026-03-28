import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";

const registerLimiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    try {
      await registerLimiter.check(5, ip);
    } catch (e) {
      if (e instanceof RateLimitError) {
        return errorResponse("Demasiadas tentativas. Tente novamente em 1 minuto.", 429);
      }
      throw e;
    }

    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existing = await db.select().from(users).where(eq(users.email, validated.email)).limit(1);

    if (existing.length > 0) {
      return errorResponse("Email já cadastrado", 409);
    }

    const hashedPassword = await hash(validated.password, 12);

    const result = await db
      .insert(users)
      .values({
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: "garcom",
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    return successResponse(result[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}
