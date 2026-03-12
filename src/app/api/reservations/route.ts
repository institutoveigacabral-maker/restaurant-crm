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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const data = await getAllReservations();
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const body = await req.json();
    const validated = reservationSchema.parse(body);
    const reservation = await createReservation(validated);

    await logActivity(session.user.id!, "create", "reservation", reservation.id, {
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

    const body = await req.json();
    const validated = reservationUpdateSchema.parse(body);
    const reservation = await updateReservation(validated.id, validated);

    await logActivity(session.user.id!, "update", "reservation", validated.id, {
      status: validated.status,
    });

    return successResponse(reservation);
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

    await softDeleteReservation(id);
    await logActivity(session.user.id!, "delete", "reservation", id);

    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
