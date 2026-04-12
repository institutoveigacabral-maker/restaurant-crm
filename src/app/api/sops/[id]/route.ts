import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { sopUpdateSchema } from "@/lib/validations/sop";
import { getSopById, updateSop, deleteSop } from "@/services/sops";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const sop = await getSopById(tenantId, Number(id));
    if (!sop) return errorResponse("SOP não encontrada", 404);

    return successResponse(sop);
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
    const data = sopUpdateSchema.parse(body);
    const sop = await updateSop(tenantId, Number(id), data);
    if (!sop) return errorResponse("SOP não encontrada", 404);

    return successResponse(sop);
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
    const sop = await getSopById(tenantId, Number(id));
    if (!sop) return errorResponse("SOP não encontrada", 404);

    await deleteSop(tenantId, Number(id));
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
