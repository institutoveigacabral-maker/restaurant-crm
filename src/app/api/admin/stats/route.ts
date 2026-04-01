import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { tenants, users, customers, sops, diagnostics } from "@/db/schema";
import { sql, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Nao autorizado", 401);

    if (session.user.role !== "owner") return errorResponse("Acesso restrito", 403);

    const [
      [tenantCount],
      [userCount],
      [customerCount],
      [sopCount],
      [diagnosticCount],
      sopsPerTenant,
      diagnosticsPerTenant,
      customersPerTenant,
    ] = await Promise.all([
      db.select({ count: count() }).from(tenants),
      db.select({ count: count() }).from(users),
      db
        .select({ count: count() })
        .from(customers)
        .where(sql`${customers.deletedAt} IS NULL`),
      db.select({ count: count() }).from(sops),
      db.select({ count: count() }).from(diagnostics),
      db
        .select({
          tenantId: sops.tenantId,
          tenantName: tenants.name,
          count: count(),
        })
        .from(sops)
        .innerJoin(tenants, sql`${sops.tenantId} = ${tenants.id}`)
        .groupBy(sops.tenantId, tenants.name),
      db
        .select({
          tenantId: diagnostics.tenantId,
          tenantName: tenants.name,
          count: count(),
        })
        .from(diagnostics)
        .innerJoin(tenants, sql`${diagnostics.tenantId} = ${tenants.id}`)
        .groupBy(diagnostics.tenantId, tenants.name),
      db
        .select({
          tenantId: customers.tenantId,
          tenantName: tenants.name,
          count: count(),
        })
        .from(customers)
        .innerJoin(tenants, sql`${customers.tenantId} = ${tenants.id}`)
        .where(sql`${customers.deletedAt} IS NULL`)
        .groupBy(customers.tenantId, tenants.name),
    ]);

    return successResponse({
      totals: {
        tenants: tenantCount.count,
        users: userCount.count,
        customers: customerCount.count,
        sops: sopCount.count,
        diagnostics: diagnosticCount.count,
      },
      sopsPerTenant,
      diagnosticsPerTenant,
      customersPerTenant,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
