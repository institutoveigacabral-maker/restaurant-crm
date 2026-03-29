import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { customers, reservations, orders } from "@/db/schema";
import { and, eq, gte, isNull, count, sum, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    // ── Revenue by day (last 30 days) ──────────────────────
    const revenueByDay = await db
      .select({
        date: orders.date,
        revenue: sum(orders.total),
      })
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          isNull(orders.deletedAt),
          gte(orders.date, thirtyDaysAgoStr)
        )
      )
      .groupBy(orders.date)
      .orderBy(orders.date);

    // ── Reservations by day (last 30 days) ─────────────────
    const reservationsByDay = await db
      .select({
        date: reservations.date,
        count: count(),
      })
      .from(reservations)
      .where(
        and(
          eq(reservations.tenantId, tenantId),
          isNull(reservations.deletedAt),
          gte(reservations.date, thirtyDaysAgoStr)
        )
      )
      .groupBy(reservations.date)
      .orderBy(reservations.date);

    // ── Top 5 customers by totalSpent ──────────────────────
    const topCustomers = await db
      .select({
        name: customers.name,
        spent: customers.totalSpent,
        visits: customers.visits,
      })
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), isNull(customers.deletedAt)))
      .orderBy(desc(customers.totalSpent))
      .limit(5);

    return successResponse({
      revenueByDay: revenueByDay.map((r) => ({
        date: r.date,
        revenue: Number(r.revenue ?? 0),
      })),
      reservationsByDay: reservationsByDay.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
      topCustomers: topCustomers.map((c) => ({
        name: c.name,
        spent: Number(c.spent ?? 0),
        visits: Number(c.visits ?? 0),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
