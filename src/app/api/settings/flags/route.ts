import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getFeatureFlags, upsertFeatureFlag } from "@/services/settings";

function isAdmin(session: Record<string, unknown>): boolean {
  const user = session.user as Record<string, unknown> | undefined;
  return user?.role === "admin";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const flags = await getFeatureFlags(tenantId);
    return successResponse(flags);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);
    if (!isAdmin(session as unknown as Record<string, unknown>))
      return errorResponse("Sem permissão", 403);

    const body = (await req.json()) as {
      key: string;
      enabled: boolean;
      description?: string;
    };

    if (!body.key) return errorResponse("Key é obrigatória");

    const flag = await upsertFeatureFlag(
      tenantId,
      body.key,
      body.enabled ?? false,
      body.description
    );
    return successResponse(flag);
  } catch (error) {
    return handleApiError(error);
  }
}
