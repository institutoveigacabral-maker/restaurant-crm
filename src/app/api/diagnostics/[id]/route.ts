import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { diagnosticUpdateSchema } from "@/lib/validations/diagnostic";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getDiagnosticById, updateDiagnostic } from "@/services/diagnostics";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const diagnostic = await getDiagnosticById(tenantId, Number(id));
    if (!diagnostic) return errorResponse("Diagnóstico não encontrado", 404);

    return successResponse(diagnostic);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const body = await req.json();
    const validated = diagnosticUpdateSchema.parse(body);
    const diagnostic = await updateDiagnostic(tenantId, Number(id), validated);
    if (!diagnostic) return errorResponse("Diagnóstico não encontrado", 404);

    return successResponse(diagnostic);
  } catch (error) {
    return handleApiError(error);
  }
}
