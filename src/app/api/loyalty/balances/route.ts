import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getAllBalances } from "@/services/loyalty";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const result = await getAllBalances(tenantId);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
