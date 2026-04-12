import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { documentCreateSchema } from "@/lib/validations/document";
import { getAllDocuments, createDocument } from "@/services/documents";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const result = await getAllDocuments(tenantId);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const user = session.user;
    const tenantId = user.tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const body = await req.json();
    const data = documentCreateSchema.parse(body);
    const result = await createDocument(tenantId, user.id, data);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
