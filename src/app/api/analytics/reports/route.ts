import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { customers, orders, reservations } from "@/db/schema";
import { sql, and, gte, lte, isNull, desc, count, sum, avg } from "drizzle-orm";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!type) return errorResponse("Tipo de relatório é obrigatório");

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startStr = from || thirtyDaysAgo.toISOString().split("T")[0];
    const endStr = to || now.toISOString().split("T")[0];

    switch (type) {
      case "sales":
        return await handleSalesReport(startStr, endStr);
      case "dishes":
        return await handleDishesReport(startStr, endStr);
      case "customers":
        return await handleCustomersReport(startStr, endStr);
      case "occupancy":
        return await handleOccupancyReport(startStr, endStr);
      default:
        return errorResponse("Tipo de relatório inválido");
    }
  } catch (error) {
    return handleApiError(error);
  }
}

async function handleSalesReport(startStr: string, endStr: string) {
  // Daily revenue
  const dailyRevenue = await db
    .select({
      date: orders.date,
      revenue: sum(orders.total),
      orderCount: count(),
    })
    .from(orders)
    .where(and(isNull(orders.deletedAt), gte(orders.date, startStr), lte(orders.date, endStr)))
    .groupBy(orders.date)
    .orderBy(orders.date);

  const dailyRevenueFormatted = dailyRevenue.map((d) => ({
    date: d.date,
    revenue: Number(d.revenue ?? 0),
    orderCount: Number(d.orderCount),
  }));

  const totalRevenue = dailyRevenueFormatted.reduce((s, d) => s + d.revenue, 0);
  const daysCount = dailyRevenueFormatted.length || 1;
  const avgDailyRevenue = Math.round((totalRevenue / daysCount) * 100) / 100;

  let bestDay: { date: string; revenue: number } | null = null;
  let worstDay: { date: string; revenue: number } | null = null;

  if (dailyRevenueFormatted.length > 0) {
    bestDay = dailyRevenueFormatted.reduce((best, d) => (d.revenue > best.revenue ? d : best));
    worstDay = dailyRevenueFormatted.reduce((worst, d) => (d.revenue < worst.revenue ? d : worst));
  }

  return successResponse({
    dailyRevenue: dailyRevenueFormatted,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    avgDailyRevenue,
    bestDay,
    worstDay,
  });
}

async function handleDishesReport(startStr: string, endStr: string) {
  // Fetch all orders in range, parse items jsonb
  const ordersInRange = await db
    .select({
      items: orders.items,
    })
    .from(orders)
    .where(and(isNull(orders.deletedAt), gte(orders.date, startStr), lte(orders.date, endStr)));

  const dishMap = new Map<string, { quantity: number; revenue: number }>();

  for (const order of ordersInRange) {
    const items = (
      typeof order.items === "string" ? JSON.parse(order.items) : order.items
    ) as OrderItem[];

    if (!Array.isArray(items)) continue;

    for (const item of items) {
      const name = item.name || "Sem nome";
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const existing = dishMap.get(name) || { quantity: 0, revenue: 0 };
      existing.quantity += qty;
      existing.revenue += price * qty;
      dishMap.set(name, existing);
    }
  }

  const topDishes = Array.from(dishMap.entries())
    .map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: Math.round(data.revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return successResponse({ topDishes });
}

async function handleCustomersReport(startStr: string, endStr: string) {
  // Top customers with their order stats in the period
  const customerStats = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      visits: customers.visits,
      totalSpent: customers.totalSpent,
      lastVisit: customers.lastVisit,
      periodSpent: sum(orders.total),
      periodOrders: count(orders.id),
    })
    .from(customers)
    .leftJoin(
      orders,
      and(
        sql`${orders.customerId} = ${customers.id}`,
        isNull(orders.deletedAt),
        gte(orders.date, startStr),
        lte(orders.date, endStr)
      )
    )
    .where(isNull(customers.deletedAt))
    .groupBy(
      customers.id,
      customers.name,
      customers.email,
      customers.visits,
      customers.totalSpent,
      customers.lastVisit
    )
    .orderBy(desc(sum(orders.total)))
    .limit(50);

  const topCustomers = customerStats.map((c) => {
    const periodSpent = Number(c.periodSpent ?? 0);
    const periodOrders = Number(c.periodOrders ?? 0);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      visits: c.visits ?? 0,
      totalSpent: Number(c.totalSpent ?? 0),
      periodSpent: Math.round(periodSpent * 100) / 100,
      periodOrders,
      avgTicket: periodOrders > 0 ? Math.round((periodSpent / periodOrders) * 100) / 100 : 0,
      lastVisit: c.lastVisit,
    };
  });

  return successResponse({ topCustomers });
}

async function handleOccupancyReport(startStr: string, endStr: string) {
  // Occupancy by day of week (0=Sunday ... 6=Saturday)
  const occupancyByDay = await db
    .select({
      dayOfWeek: sql<number>`extract(dow from ${reservations.date}::date)`.as("day_of_week"),
      count: count(),
      avgGuests: avg(reservations.guests),
    })
    .from(reservations)
    .where(
      and(
        isNull(reservations.deletedAt),
        gte(reservations.date, startStr),
        lte(reservations.date, endStr)
      )
    )
    .groupBy(sql`extract(dow from ${reservations.date}::date)`)
    .orderBy(sql`extract(dow from ${reservations.date}::date)`);

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const occupancyByDayFormatted = occupancyByDay.map((d) => ({
    dayOfWeek: Number(d.dayOfWeek),
    dayName: dayNames[Number(d.dayOfWeek)] ?? "Desconhecido",
    reservations: Number(d.count),
    avgGuests: Math.round(Number(d.avgGuests ?? 0) * 10) / 10,
  }));

  // Occupancy by hour
  const occupancyByHour = await db
    .select({
      hour: sql<string>`substring(${reservations.time} from 1 for 2)`.as("hour"),
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
    .groupBy(sql`substring(${reservations.time} from 1 for 2)`)
    .orderBy(sql`substring(${reservations.time} from 1 for 2)`);

  const occupancyByHourFormatted = occupancyByHour.map((h) => ({
    hour: h.hour,
    reservations: Number(h.count),
  }));

  // Average guests per reservation
  const [avgGuestsResult] = await db
    .select({
      avgGuests: avg(reservations.guests),
    })
    .from(reservations)
    .where(
      and(
        isNull(reservations.deletedAt),
        gte(reservations.date, startStr),
        lte(reservations.date, endStr)
      )
    );

  const avgGuestsPerReservation = Math.round(Number(avgGuestsResult?.avgGuests ?? 0) * 10) / 10;

  return successResponse({
    occupancyByDay: occupancyByDayFormatted,
    occupancyByHour: occupancyByHourFormatted,
    avgGuestsPerReservation,
  });
}
