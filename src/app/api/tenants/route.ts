import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getTenantsForUser } from "@/lib/tenant";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Não autorizado", 401);

    const tenants = await getTenantsForUser(session.user.id);
    return successResponse(tenants);
  } catch (error) {
    return handleApiError(error);
  }
}
