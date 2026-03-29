import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getBalance, getTransactions } from "@/services/loyalty";

export async function GET(
  _req: NextRequest,
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

    const [balance, transactions] = await Promise.all([
      getBalance(tenantId, id),
      getTransactions(tenantId, id),
    ]);

    return successResponse({ balance, transactions });
  } catch (error) {
    return handleApiError(error);
  }
}
