import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCustomerById } from "@/services/customers";
import { db } from "@/db";
import { reservations, orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const customer = await getCustomerById(tenantId, Number(id));
    if (!customer) return errorResponse("Cliente não encontrado", 404);

    const customerReservations = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.tenantId, tenantId), eq(reservations.customerId, Number(id))));

    const customerOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), eq(orders.customerId, Number(id))));

    return successResponse({
      customer,
      reservations: customerReservations,
      orders: customerOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
