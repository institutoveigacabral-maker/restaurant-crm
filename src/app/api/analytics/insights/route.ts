import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { sql, and, gte, lte, isNull, desc, count, sum, avg, or, lt } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    // ── Churn Risk ─────────────────────────────────────────────
    // Customers whose lastVisit is more than 30 days ago or null
    const churnRisk = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        visits: customers.visits,
        totalSpent: customers.totalSpent,
        lastVisit: customers.lastVisit,
        tags: customers.tags,
      })
      .from(customers)
      .where(
        and(
          isNull(customers.deletedAt),
          or(isNull(customers.lastVisit), lt(customers.lastVisit, thirtyDaysAgoStr))
        )
      )
      .orderBy(desc(customers.totalSpent))
      .limit(20);

    const churnRiskFormatted = churnRisk.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      visits: c.visits ?? 0,
      totalSpent: Number(c.totalSpent ?? 0),
      lastVisit: c.lastVisit,
      tags: c.tags ?? [],
    }));

    // ── VIP Customers ──────────────────────────────────────────
    // Customers with tag 'VIP' or totalSpent > average * 2
    const [avgResult] = await db
      .select({ avgSpent: avg(customers.totalSpent) })
      .from(customers)
      .where(isNull(customers.deletedAt));

    const avgSpent = Number(avgResult?.avgSpent ?? 0);
    const vipThreshold = avgSpent * 2;

    const vipCustomers = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        visits: customers.visits,
        totalSpent: customers.totalSpent,
        lastVisit: customers.lastVisit,
        tags: customers.tags,
      })
      .from(customers)
      .where(
        and(
          isNull(customers.deletedAt),
          or(
            sql`'VIP' = ANY(${customers.tags})`,
            sql`CAST(${customers.totalSpent} AS numeric) > ${vipThreshold}`
          )
        )
      )
      .orderBy(desc(customers.totalSpent))
      .limit(20);

    const vipCustomersFormatted = vipCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      visits: c.visits ?? 0,
      totalSpent: Number(c.totalSpent ?? 0),
      lastVisit: c.lastVisit,
      tags: c.tags ?? [],
    }));

    // ── Trends Alert ───────────────────────────────────────────
    // Compare this week vs last week
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekStartStr = thisWeekStart.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];
    const lastWeekStartStr = lastWeekStart.toISOString().split("T")[0];
    const lastWeekEndStr = thisWeekStartStr;

    const [thisWeekStats] = await db
      .select({
        revenue: sum(orders.total),
        orders: count(),
      })
      .from(orders)
      .where(
        and(
          isNull(orders.deletedAt),
          gte(orders.date, thisWeekStartStr),
          lte(orders.date, todayStr)
        )
      );

    const [lastWeekStats] = await db
      .select({
        revenue: sum(orders.total),
        orders: count(),
      })
      .from(orders)
      .where(
        and(
          isNull(orders.deletedAt),
          gte(orders.date, lastWeekStartStr),
          lte(orders.date, lastWeekEndStr)
        )
      );

    const thisWeekRevenue = Number(thisWeekStats?.revenue ?? 0);
    const lastWeekRevenue = Number(lastWeekStats?.revenue ?? 0);
    const thisWeekOrders = Number(thisWeekStats?.orders ?? 0);
    const lastWeekOrders = Number(lastWeekStats?.orders ?? 0);

    const revenueChange =
      lastWeekRevenue > 0
        ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 * 10) / 10
        : thisWeekRevenue > 0
          ? 100
          : 0;

    const ordersChange =
      lastWeekOrders > 0
        ? Math.round(((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100 * 10) / 10
        : thisWeekOrders > 0
          ? 100
          : 0;

    const trendsAlert = {
      thisWeek: {
        revenue: thisWeekRevenue,
        orders: thisWeekOrders,
      },
      lastWeek: {
        revenue: lastWeekRevenue,
        orders: lastWeekOrders,
      },
      revenueChangePercent: revenueChange,
      ordersChangePercent: ordersChange,
    };

    return successResponse({
      churnRisk: churnRiskFormatted,
      vipCustomers: vipCustomersFormatted,
      trendsAlert,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
