import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { tenants, tenantUsers, customers, sops, diagnostics } from "@/db/schema";
import { sql, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Nao autorizado", 401);

    if (session.user.role !== "owner") return errorResponse("Acesso restrito", 403);

    const [allTenants, userCounts, customerCounts, sopCounts, diagnosticCounts] = await Promise.all(
      [
        db.select().from(tenants),
        db
          .select({ tenantId: tenantUsers.tenantId, count: count() })
          .from(tenantUsers)
          .groupBy(tenantUsers.tenantId),
        db
          .select({ tenantId: customers.tenantId, count: count() })
          .from(customers)
          .where(sql`${customers.deletedAt} IS NULL`)
          .groupBy(customers.tenantId),
        db.select({ tenantId: sops.tenantId, count: count() }).from(sops).groupBy(sops.tenantId),
        db
          .select({ tenantId: diagnostics.tenantId, count: count() })
          .from(diagnostics)
          .groupBy(diagnostics.tenantId),
      ]
    );

    // Build lookup maps
    const usersMap = Object.fromEntries(userCounts.map((r) => [r.tenantId, r.count]));
    const customersMap = Object.fromEntries(customerCounts.map((r) => [r.tenantId, r.count]));
    const sopsMap = Object.fromEntries(sopCounts.map((r) => [r.tenantId, r.count]));
    const diagnosticsMap = Object.fromEntries(diagnosticCounts.map((r) => [r.tenantId, r.count]));

    // Enrich tenants with stats
    const enriched = allTenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      parentId: t.parentId,
      plan: t.plan,
      primaryColor: t.primaryColor,
      active: t.active,
      createdAt: t.createdAt,
      stats: {
        users: usersMap[t.id] ?? 0,
        customers: customersMap[t.id] ?? 0,
        sops: sopsMap[t.id] ?? 0,
        diagnostics: diagnosticsMap[t.id] ?? 0,
      },
    }));

    // Build hierarchy: parents with children
    const parents = enriched.filter((t) => !t.parentId);
    const children = enriched.filter((t) => t.parentId);

    const hierarchy = parents.map((parent) => ({
      ...parent,
      type: "grupo" as const,
      children: children
        .filter((c) => c.parentId === parent.id)
        .map((c) => ({ ...c, type: "marca" as const })),
    }));

    // Orphan tenants (no parent, no children) - treat as standalone
    const parentIds = new Set(parents.map((p) => p.id));
    const standalone = children.filter((c) => !parentIds.has(c.parentId!));

    return successResponse({ hierarchy, standalone, total: allTenants.length });
  } catch (error) {
    return handleApiError(error);
  }
}
