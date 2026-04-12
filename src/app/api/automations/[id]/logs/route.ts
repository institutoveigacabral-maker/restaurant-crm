import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getAutomationLogs } from "@/services/automations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;

    const logs = await getAutomationLogs(tenantId, Number(id), limit);
    return successResponse(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
