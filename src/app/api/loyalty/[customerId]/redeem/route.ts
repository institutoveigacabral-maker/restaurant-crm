import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { redeemPoints } from "@/services/loyalty";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { customerId } = await params;
    const id = parseInt(customerId, 10);
    if (isNaN(id)) return errorResponse("customerId invalido", 400);

    const body = await req.json();
    const points = parseInt(body.points, 10);
    if (isNaN(points) || points <= 0) return errorResponse("Pontos invalidos", 400);

    const result = await redeemPoints(tenantId, id, points, body.description);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
