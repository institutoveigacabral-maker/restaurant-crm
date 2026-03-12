import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getAllOrders, updateOrderStatus, softDeleteOrder } from "@/services/orders";
import { logActivity } from "@/services/activity";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const data = await getAllOrders();
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return errorResponse("ID e status são obrigatórios");

    const order = await updateOrderStatus(Number(id), status);
    await logActivity(session.user.id!, "update", "order", id, { status });

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return errorResponse("ID inválido");

    await softDeleteOrder(id);
    await logActivity(session.user.id!, "delete", "order", id);

    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
