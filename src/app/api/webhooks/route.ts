import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getAllWebhooks, createWebhook, updateWebhook, deleteWebhook } from "@/services/webhooks";

function isAdmin(session: Record<string, unknown>): boolean {
  const user = session.user as Record<string, unknown> | undefined;
  return user?.role === "admin";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    if (!isAdmin(session as unknown as Record<string, unknown>))
      return errorResponse("Sem permissão", 403);

    const data = await getAllWebhooks();
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    if (!isAdmin(session as unknown as Record<string, unknown>))
      return errorResponse("Sem permissão", 403);

    const body = await req.json();
    const { name, url, events } = body as {
      name: string;
      url: string;
      events: string[];
    };

    if (!name || !url) return errorResponse("Nome e URL são obrigatórios");

    const webhook = await createWebhook({ name, url, events: events ?? [] });
    return successResponse(webhook, 201);
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

    const body = await req.json();
    const { id, ...data } = body as {
      id: number;
      name?: string;
      url?: string;
      events?: string[];
      active?: boolean;
    };

    if (!id) return errorResponse("ID inválido");

    const webhook = await updateWebhook(id, data);
    return successResponse(webhook);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    if (!isAdmin(session as unknown as Record<string, unknown>))
      return errorResponse("Sem permissão", 403);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return errorResponse("ID inválido");

    await deleteWebhook(id);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
