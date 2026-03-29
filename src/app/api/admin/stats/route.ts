import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { tenants, users, customers, sops, diagnostics } from "@/db/schema";
import { sql, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Nao autorizado", 401);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any).role as string;
    if (role !== "owner") return errorResponse("Acesso restrito", 403);

    // Global counts
    const [tenantCount] = await db.select({ count: count() }).from(tenants);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [customerCount] = await db
      .select({ count: count() })
      .from(customers)
      .where(sql`${customers.deletedAt} IS NULL`);
    const [sopCount] = await db.select({ count: count() }).from(sops);
    const [diagnosticCount] = await db.select({ count: count() }).from(diagnostics);

    // SOPs per tenant
    const sopsPerTenant = await db
      .select({
        tenantId: sops.tenantId,
        tenantName: tenants.name,
        count: count(),
      })
      .from(sops)
      .innerJoin(tenants, sql`${sops.tenantId} = ${tenants.id}`)
      .groupBy(sops.tenantId, tenants.name);

    // Diagnostics per tenant
    const diagnosticsPerTenant = await db
      .select({
        tenantId: diagnostics.tenantId,
        tenantName: tenants.name,
        count: count(),
      })
      .from(diagnostics)
      .innerJoin(tenants, sql`${diagnostics.tenantId} = ${tenants.id}`)
      .groupBy(diagnostics.tenantId, tenants.name);

    // Customers per tenant (for distribution chart)
    const customersPerTenant = await db
      .select({
        tenantId: customers.tenantId,
        tenantName: tenants.name,
        count: count(),
      })
      .from(customers)
      .innerJoin(tenants, sql`${customers.tenantId} = ${tenants.id}`)
      .where(sql`${customers.deletedAt} IS NULL`)
      .groupBy(customers.tenantId, tenants.name);

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
