import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { customers, reservations, orders, sops, employeeProfiles } from "@/db/schema";
import { and, eq, gte, isNull, count, sum, avg, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = now.toISOString().split("T")[0];

    // Start of week (Monday)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - mondayOffset);
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

    // Previous month for trend calculation
    const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── Customers ──────────────────────────────────────────
    const [customersTotal] = await db
      .select({ total: count() })
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), isNull(customers.deletedAt)));

    const [customersNewThisMonth] = await db
      .select({ total: count() })
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          isNull(customers.deletedAt),
          gte(customers.createdAt, firstOfMonth)
        )
      );

    const [customersPrevMonth] = await db
      .select({ total: count() })
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          isNull(customers.deletedAt),
          gte(customers.createdAt, firstOfPrevMonth),
          sql`${customers.createdAt} < ${firstOfMonth}`
        )
      );

    const custNew = Number(customersNewThisMonth.total);
    const custPrev = Number(customersPrevMonth.total);
    const custTrend =
      custPrev > 0
        ? `${custNew >= custPrev ? "+" : ""}${Math.round(((custNew - custPrev) / custPrev) * 100)}%`
        : custNew > 0
          ? "+100%"
          : "0%";

    // ── Reservations ───────────────────────────────────────
    const [reservationsToday] = await db
      .select({ total: count() })
      .from(reservations)
      .where(
        and(
          eq(reservations.tenantId, tenantId),
          isNull(reservations.deletedAt),
          eq(reservations.date, today)
        )
      );

    const [reservationsThisWeek] = await db
      .select({ total: count() })
      .from(reservations)
      .where(
        and(
          eq(reservations.tenantId, tenantId),
          isNull(reservations.deletedAt),
          gte(reservations.date, startOfWeekStr)
        )
      );

    // Previous week for trend
    const prevWeekStart = new Date(startOfWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(startOfWeek);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

    const [reservationsPrevWeek] = await db
      .select({ total: count() })
      .from(reservations)
      .where(
        and(
          eq(reservations.tenantId, tenantId),
          isNull(reservations.deletedAt),
          gte(reservations.date, prevWeekStart.toISOString().split("T")[0]),
          sql`${reservations.date} <= ${prevWeekEnd.toISOString().split("T")[0]}`
        )
      );

    const resWeek = Number(reservationsThisWeek.total);
    const resPrev = Number(reservationsPrevWeek.total);
    const resTrend =
      resPrev > 0
        ? `${resWeek >= resPrev ? "+" : ""}${Math.round(((resWeek - resPrev) / resPrev) * 100)}%`
        : resWeek > 0
          ? "+100%"
          : "0%";

    // ── Orders ─────────────────────────────────────────────
    const [ordersToday] = await db
      .select({
        total: count(),
        revenue: sum(orders.total),
        avgTicket: avg(orders.total),
      })
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), isNull(orders.deletedAt), eq(orders.date, today)));

    // ── SOPs ───────────────────────────────────────────────
    const [sopsTotal] = await db
      .select({ total: count() })
      .from(sops)
      .where(eq(sops.tenantId, tenantId));

    const [sopsPublished] = await db
      .select({ total: count() })
      .from(sops)
      .where(and(eq(sops.tenantId, tenantId), eq(sops.status, "published")));

    // ── Team (Employee Profiles) ───────────────────────────
    const [teamStats] = await db
      .select({
        totalXp: sum(employeeProfiles.totalXp),
        avgLevel: avg(employeeProfiles.level),
        activeMembers: count(),
      })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.tenantId, tenantId));

    return successResponse({
      customers: {
        total: Number(customersTotal.total),
        newThisMonth: custNew,
        trend: custTrend,
      },
      reservations: {
        today: Number(reservationsToday.total),
        thisWeek: resWeek,
        trend: resTrend,
      },
      orders: {
        today: Number(ordersToday.total),
        revenue: Number(ordersToday.revenue ?? 0),
        avgTicket: Math.round(Number(ordersToday.avgTicket ?? 0) * 100) / 100,
      },
      sops: {
        total: Number(sopsTotal.total),
        published: Number(sopsPublished.total),
      },
      team: {
        totalXp: Number(teamStats.totalXp ?? 0),
        avgLevel: Math.round(Number(teamStats.avgLevel ?? 0)),
        activeMembers: Number(teamStats.activeMembers),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
