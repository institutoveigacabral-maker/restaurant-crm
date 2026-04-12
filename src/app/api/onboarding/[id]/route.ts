import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { checklistUpdateSchema } from "@/lib/validations/onboarding";
import { getChecklistById, updateChecklist, deleteChecklist } from "@/services/onboarding";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const checklist = await getChecklistById(tenantId, Number(id));
    if (!checklist) return errorResponse("Checklist não encontrada", 404);

    return successResponse(checklist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const body = await req.json();
    const data = checklistUpdateSchema.parse(body);
    const checklist = await updateChecklist(tenantId, Number(id), data);
    if (!checklist) return errorResponse("Checklist não encontrada", 404);

    return successResponse(checklist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const checklist = await getChecklistById(tenantId, Number(id));
    if (!checklist) return errorResponse("Checklist não encontrada", 404);

    await deleteChecklist(tenantId, Number(id));
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
