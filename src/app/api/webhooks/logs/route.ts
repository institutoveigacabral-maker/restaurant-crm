import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getWebhookLogs } from "@/services/webhooks";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const webhookId = Number(searchParams.get("webhookId"));
    if (!webhookId) return errorResponse("webhookId inválido");

    const logs = await getWebhookLogs(webhookId);
    return successResponse(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
