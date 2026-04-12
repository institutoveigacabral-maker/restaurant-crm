import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { automationCreateSchema } from "@/lib/validations/automation";
import { getAllAutomations, createAutomation } from "@/services/automations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const result = await getAllAutomations(tenantId);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const body = await req.json();
    const data = automationCreateSchema.parse(body);
    const result = await createAutomation(tenantId, data);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
