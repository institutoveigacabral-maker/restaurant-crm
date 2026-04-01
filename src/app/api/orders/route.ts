import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { createOrder, getAllOrders, updateOrderStatus, softDeleteOrder } from "@/services/orders";
import { logActivity } from "@/services/activity";
import { orderCreateSchema } from "@/lib/validations/order";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const data = await getAllOrders(tenantId);
    return successResponse(data);
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
    const validated = orderCreateSchema.parse(body);

    const order = await createOrder(tenantId, {
      customerId: validated.customerId,
      customerName: validated.customerName,
      items: validated.items,
      total: validated.total,
      status: validated.status,
      date: validated.date,
    });
    await logActivity(tenantId, session.user.id!, "create", "order", order.id, {
      customerName: validated.customerName,
    });

    return successResponse(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return errorResponse("ID e status são obrigatórios");

    const order = await updateOrderStatus(tenantId, Number(id), status);
    await logActivity(tenantId, session.user.id!, "update", "order", id, { status });

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return errorResponse("ID inválido");

    await softDeleteOrder(tenantId, id);
    await logActivity(tenantId, session.user.id!, "delete", "order", id);

    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
