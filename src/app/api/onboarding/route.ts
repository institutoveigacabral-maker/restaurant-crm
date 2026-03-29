import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { checklistCreateSchema } from "@/lib/validations/onboarding";
import { getAllChecklists, createChecklist } from "@/services/onboarding";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const result = await getAllChecklists(tenantId);
    return successResponse(result);
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

    const body = await req.json();
    const data = checklistCreateSchema.parse(body);
    const result = await createChecklist(tenantId, data);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
