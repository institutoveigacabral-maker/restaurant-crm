import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { sops, employeeBadges, customers, automations, diagnostics } from "@/db/schema";
import { and, eq, gte, isNull, count, asc, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    // SOPs criados
    const [sopsResult] = await db
      .select({ total: count() })
      .from(sops)
      .where(eq(sops.tenantId, tenantId));

    // Badges concedidos
    const [badgesResult] = await db
      .select({ total: count() })
      .from(employeeBadges)
      .where(eq(employeeBadges.tenantId, tenantId));

    // Automacoes ativas
    const [automationsResult] = await db
      .select({ total: count() })
      .from(automations)
      .where(and(eq(automations.tenantId, tenantId), eq(automations.active, true)));

    // Primeiro diagnostico (marco de inicio)
    const [firstDiagnostic] = await db
      .select({
        createdAt: diagnostics.createdAt,
        overallScore: diagnostics.overallScore,
      })
      .from(diagnostics)
      .where(eq(diagnostics.tenantId, tenantId))
      .orderBy(asc(diagnostics.createdAt))
      .limit(1);

    // Ultimo diagnostico
    const [lastDiagnostic] = await db
      .select({
        overallScore: diagnostics.overallScore,
      })
      .from(diagnostics)
      .where(eq(diagnostics.tenantId, tenantId))
      .orderBy(desc(diagnostics.createdAt))
      .limit(1);

    // Clientes novos desde primeiro diagnostico
    let newCustomers = 0;
    if (firstDiagnostic?.createdAt) {
      const [customersResult] = await db
        .select({ total: count() })
        .from(customers)
        .where(
          and(
            eq(customers.tenantId, tenantId),
            isNull(customers.deletedAt),
            gte(customers.createdAt, firstDiagnostic.createdAt)
          )
        );
      newCustomers = Number(customersResult.total);
    }

    const maturityStart = Number(firstDiagnostic?.overallScore ?? 0);
    const maturityNow = Number(lastDiagnostic?.overallScore ?? 0);
    const maturityDelta = maturityNow - maturityStart;

    return successResponse({
      sopsCreated: Number(sopsResult.total),
      badgesAwarded: Number(badgesResult.total),
      newCustomers,
      automationsActive: Number(automationsResult.total),
      maturityStart,
      maturityNow,
      maturityDelta,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
