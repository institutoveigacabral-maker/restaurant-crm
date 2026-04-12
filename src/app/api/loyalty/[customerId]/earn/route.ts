import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { earnPoints } from "@/services/loyalty";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { customerId } = await params;
    const id = parseInt(customerId, 10);
    if (isNaN(id)) return errorResponse("customerId invalido", 400);

    const body = await req.json();
    const points = parseInt(body.points, 10);
    if (isNaN(points) || points <= 0) return errorResponse("Pontos invalidos", 400);

    const result = await earnPoints(tenantId, id, points, body.description, body.orderId);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
