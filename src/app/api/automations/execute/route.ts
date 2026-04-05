import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { runInactiveCustomerCheck, runReservationReminders } from "@/services/automation-engine";

/**
 * POST /api/automations/execute
 * Executa automacoes baseadas em cron (inactive customers, reservation reminders).
 * Pode ser chamado manualmente ou via Vercel Cron.
 */
export async function POST(req: Request) {
  try {
    // Auth: aceita header Authorization para cron, ou session para manual
    const cronSecret = req.headers.get("authorization")?.replace("Bearer ", "");
    let tenantId: string;

    if (cronSecret && cronSecret === process.env.CRON_SECRET) {
      // Cron job — executa para todos os tenants
      // Para v1, requer tenantId no body
      const body = await req.json();
      tenantId = body.tenantId;
      if (!tenantId) return errorResponse("tenantId obrigatorio para cron", 400);
    } else {
      // Manual — usa session
      const session = await auth();
      if (!session?.user) return errorResponse("Nao autorizado", 401);
      tenantId = session.user.tenantId || "";
      if (!tenantId) return errorResponse("No tenant", 400);
    }

    const results = await Promise.all([
      runInactiveCustomerCheck(tenantId),
      runReservationReminders(tenantId),
    ]);

    return successResponse({
      inactiveCustomers: results[0],
      reservationReminders: results[1],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
