import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { reservationSchema, reservationUpdateSchema } from "@/lib/validations/reservation";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import {
  getAllReservations,
  createReservation,
  updateReservation,
  softDeleteReservation,
} from "@/services/reservations";
import { logActivity } from "@/services/activity";
import { onReservationConfirmed } from "@/services/automation-engine";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const data = await getAllReservations(tenantId);
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
    const validated = reservationSchema.parse(body);
    const reservation = await createReservation(tenantId, validated);

    await logActivity(tenantId, session.user.id!, "create", "reservation", reservation.id, {
      customer: validated.customerName,
      date: validated.date,
    });

    return successResponse(reservation, 201);
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
    const validated = reservationUpdateSchema.parse(body);
    const reservation = await updateReservation(tenantId, validated.id, validated);

    await logActivity(tenantId, session.user.id!, "update", "reservation", validated.id, {
      status: validated.status,
    });

    // Trigger automation: reservation confirmed
    if (validated.status === "confirmed" && reservation) {
      onReservationConfirmed(tenantId, {
        customerName: reservation.customerName || validated.customerName,
        date: reservation.date || validated.date,
        time: reservation.time || validated.time,
        guests: reservation.guests || validated.guests,
        table: reservation.tableName || validated.table || "",
      }).catch(() => {}); // fire-and-forget, nao bloqueia a response
    }

    return successResponse(reservation);
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

    await softDeleteReservation(tenantId, id);
    await logActivity(tenantId, session.user.id!, "delete", "reservation", id);

    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
