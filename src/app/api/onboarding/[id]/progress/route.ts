import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { progressUpdateSchema } from "@/lib/validations/onboarding";
import { getProgressForUser, updateProgress } from "@/services/onboarding";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const progress = await getProgressForUser(tenantId, user.id, Number(id));
    return successResponse(progress ?? { completedItems: [], completedAt: null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const body = await req.json();
    const data = progressUpdateSchema.parse(body);
    const result = await updateProgress(tenantId, user.id, Number(id), data.completedItems);
    if (!result) return errorResponse("Checklist não encontrada", 404);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
