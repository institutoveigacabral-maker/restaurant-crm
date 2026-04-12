import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Nao autorizado", 401);

    const tenantId = session.user?.tenantId;
    if (!tenantId) return errorResponse("Tenant nao encontrado", 404);

    const result = await db
      .select({
        name: tenants.name,
        logo: tenants.logo,
        primaryColor: tenants.primaryColor,
        secondaryColor: tenants.secondaryColor,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const tenant = result[0];
    if (!tenant) return errorResponse("Tenant nao encontrado", 404);

    return successResponse({
      name: tenant.name,
      logo: tenant.logo,
      primaryColor: tenant.primaryColor ?? "#1a365d",
      secondaryColor: tenant.secondaryColor ?? "#e2e8f0",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
