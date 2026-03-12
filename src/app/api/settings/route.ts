import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getSettings, updateSettings } from "@/services/settings";

function isAdmin(session: Record<string, unknown>): boolean {
  const user = session.user as Record<string, unknown> | undefined;
  return user?.role === "admin";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const settings = await getSettings();
    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    if (!isAdmin(session as unknown as Record<string, unknown>))
      return errorResponse("Sem permissão", 403);

    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === "number" ? body.id : undefined;
    if (!id) return errorResponse("ID é obrigatório");

    const updated = await updateSettings(id, body as Parameters<typeof updateSettings>[1]);
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
