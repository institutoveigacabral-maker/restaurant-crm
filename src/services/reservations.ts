import { db } from "@/db";
import { reservations } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { ReservationInput } from "@/lib/validations/reservation";

export async function getAllReservations() {
  return db
    .select()
    .from(reservations)
    .where(isNull(reservations.deletedAt))
    .orderBy(reservations.date);
}

export async function createReservation(data: ReservationInput) {
  const result = await db
    .insert(reservations)
    .values({
      customerId: data.customerId,
      customerName: data.customerName,
      date: data.date,
      time: data.time,
      guests: data.guests,
      tableName: data.table,
      status: data.status,
      notes: data.notes,
    })
    .returning();
  return result[0];
}

export async function updateReservation(id: number, data: ReservationInput) {
  const result = await db
    .update(reservations)
    .set({
      customerId: data.customerId,
      customerName: data.customerName,
      date: data.date,
      time: data.time,
      guests: data.guests,
      tableName: data.table,
      status: data.status,
      notes: data.notes,
    })
    .where(eq(reservations.id, id))
    .returning();
  return result[0];
}

export async function softDeleteReservation(id: number) {
  await db.update(reservations).set({ deletedAt: new Date() }).where(eq(reservations.id, id));
}
