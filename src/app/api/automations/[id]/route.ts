import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { automationUpdateSchema } from "@/lib/validations/automation";
import {
  getAutomationById,
  updateAutomation,
  toggleAutomation,
  deleteAutomation,
} from "@/services/automations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const automation = await getAutomationById(tenantId, Number(id));
    if (!automation) return errorResponse("Automacao nao encontrada", 404);

    return successResponse(automation);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const body = await req.json();

    // Toggle: PUT com body { toggle: true }
    if (body.toggle === true) {
      const automation = await toggleAutomation(tenantId, Number(id));
      if (!automation) return errorResponse("Automacao nao encontrada", 404);
      return successResponse(automation);
    }

    const data = automationUpdateSchema.parse(body);
    const automation = await updateAutomation(tenantId, Number(id), data);
    if (!automation) return errorResponse("Automacao nao encontrada", 404);

    return successResponse(automation);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const automation = await getAutomationById(tenantId, Number(id));
    if (!automation) return errorResponse("Automacao nao encontrada", 404);

    await deleteAutomation(tenantId, Number(id));
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
