import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getAllBalances } from "@/services/loyalty";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const result = await getAllBalances(tenantId);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
