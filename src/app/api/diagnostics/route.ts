import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { diagnosticCreateSchema } from "@/lib/validations/diagnostic";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getAllDiagnostics, createDiagnostic } from "@/services/diagnostics";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const data = await getAllDiagnostics(tenantId);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const body = await req.json();
    const validated = diagnosticCreateSchema.parse(body);
    const diagnostic = await createDiagnostic(tenantId, user.id, validated);

    return successResponse(diagnostic, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
