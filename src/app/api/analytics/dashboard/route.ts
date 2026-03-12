import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { customers, orders, reservations } from "@/db/schema";
import { sql, and, gte, lte, isNull, desc, count, sum } from "drizzle-orm";

function getDateRange(
  period: string,
  from?: string | null,
  to?: string | null
): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      return { start: today, end: now };
    case "week": {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);
      return { start: weekStart, end: now };
    }
    case "month": {
      const monthStart = new Date(today);
      monthStart.setMonth(monthStart.getMonth() - 1);
      return { start: monthStart, end: now };
    }
    case "year": {
      const yearStart = new Date(today);
      yearStart.setFullYear(yearStart.getFullYear() - 1);
      return { start: yearStart, end: now };
    }
    case "custom": {
      if (!from || !to) {
        return { start: today, end: now };
      }
      return { start: new Date(from), end: new Date(to) };
    }
    default:
      return { start: today, end: now };
  }
}

function getPreviousPeriodRange(start: Date, end: Date): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime();
  return {
    start: new Date(start.getTime() - duration),
    end: new Date(start.getTime()),
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const { start, end } = getDateRange(period, from, to);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    const prev = getPreviousPeriodRange(start, end);
    const prevStartStr = prev.start.toISOString().split("T")[0];
    const prevEndStr = prev.end.toISOString().split("T")[0];

    // Total revenue & orders for the period
    const [revenueResult] = await db
      .select({
        totalRevenue: sum(orders.total),
        totalOrders: count(),
      })
      .from(orders)
      .where(and(isNull(orders.deletedAt), gte(orders.date, startStr), lte(orders.date, endStr)));

    const totalRevenue = Number(revenueResult?.totalRevenue ?? 0);
    const totalOrders = Number(revenueResult?.totalOrders ?? 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Previous period revenue & orders
    const [prevRevenueResult] = await db
      .select({
        totalRevenue: sum(orders.total),
        totalOrders: count(),
      })
      .from(orders)
      .where(
        and(isNull(orders.deletedAt), gte(orders.date, prevStartStr), lte(orders.date, prevEndStr))
      );

    const previousPeriodRevenue = Number(prevRevenueResult?.totalRevenue ?? 0);
    const previousPeriodOrders = Number(prevRevenueResult?.totalOrders ?? 0);

    // Total reservations for the period
    const [reservationResult] = await db
      .select({ totalReservations: count() })
      .from(reservations)
      .where(
        and(
          isNull(reservations.deletedAt),
          gte(reservations.date, startStr),
          lte(reservations.date, endStr)
        )
      );

    const totalReservations = Number(reservationResult?.totalReservations ?? 0);

    // New customers in the period
    const [newCustomersResult] = await db
      .select({ totalNewCustomers: count() })
      .from(customers)
      .where(
        and(
          isNull(customers.deletedAt),
          gte(customers.createdAt, start),
          lte(customers.createdAt, end)
        )
      );

    const totalNewCustomers = Number(newCustomersResult?.totalNewCustomers ?? 0);

    // Revenue by day (for chart)
    const revenueByDay = await db
      .select({
        date: orders.date,
        revenue: sum(orders.total),
      })
      .from(orders)
      .where(and(isNull(orders.deletedAt), gte(orders.date, startStr), lte(orders.date, endStr)))
      .groupBy(orders.date)
      .orderBy(orders.date);

    const revenueByDayFormatted = revenueByDay.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue ?? 0),
    }));

    // Orders by status
    const ordersByStatus = await db
      .select({
        status: orders.status,
        count: count(),
      })
      .from(orders)
      .where(and(isNull(orders.deletedAt), gte(orders.date, startStr), lte(orders.date, endStr)))
      .groupBy(orders.status);

    const ordersByStatusFormatted = ordersByStatus.map((o) => ({
      status: o.status,
      count: Number(o.count),
    }));

    // Reservations by status
    const reservationsByStatus = await db
      .select({
        status: reservations.status,
        count: count(),
      })
      .from(reservations)
      .where(
        and(
          isNull(reservations.deletedAt),
          gte(reservations.date, startStr),
          lte(reservations.date, endStr)
        )
      )
      .groupBy(reservations.status);

    const reservationsByStatusFormatted = reservationsByStatus.map((r) => ({
      status: r.status,
      count: Number(r.count),
    }));

    // Top 5 customers by spending in period
    const topCustomers = await db
      .select({
        id: orders.customerId,
        customerName: orders.customerName,
        totalSpent: sum(orders.total),
        orderCount: count(),
      })
      .from(orders)
      .where(and(isNull(orders.deletedAt), gte(orders.date, startStr), lte(orders.date, endStr)))
      .groupBy(orders.customerId, orders.customerName)
      .orderBy(desc(sum(orders.total)))
      .limit(5);

    const topCustomersFormatted = topCustomers.map((c) => ({
      id: c.id,
      customerName: c.customerName,
      totalSpent: Number(c.totalSpent ?? 0),
      orderCount: Number(c.orderCount),
    }));

    // Peak hours (from reservation times)
    const peakHours = await db
      .select({
        hour: sql<string>`substring(${reservations.time} from 1 for 2)`.as("hour"),
        reservations: count(),
      })
      .from(reservations)
      .where(
        and(
          isNull(reservations.deletedAt),
          gte(reservations.date, startStr),
          lte(reservations.date, endStr)
        )
      )
      .groupBy(sql`substring(${reservations.time} from 1 for 2)`)
      .orderBy(sql`substring(${reservations.time} from 1 for 2)`);

    const peakHoursFormatted = peakHours.map((p) => ({
      hour: p.hour,
      reservations: Number(p.reservations),
    }));

    return successResponse({
      totalRevenue,
      totalOrders,
      totalReservations,
      totalNewCustomers,
      avgTicket: Math.round(avgTicket * 100) / 100,
      previousPeriodRevenue,
      previousPeriodOrders,
      revenueByDay: revenueByDayFormatted,
      ordersByStatus: ordersByStatusFormatted,
      reservationsByStatus: reservationsByStatusFormatted,
      topCustomers: topCustomersFormatted,
      peakHours: peakHoursFormatted,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
