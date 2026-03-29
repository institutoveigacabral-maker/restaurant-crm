import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { documentUpdateSchema } from "@/lib/validations/document";
import { getDocumentById, updateDocument, deleteDocument } from "@/services/documents";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const doc = await getDocumentById(tenantId, Number(id));
    if (!doc) return errorResponse("Documento não encontrado", 404);

    return successResponse(doc);
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
    const data = documentUpdateSchema.parse(body);
    const doc = await updateDocument(tenantId, Number(id), data);
    if (!doc) return errorResponse("Documento não encontrado", 404);

    return successResponse(doc);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { id } = await params;
    const doc = await getDocumentById(tenantId, Number(id));
    if (!doc) return errorResponse("Documento não encontrado", 404);

    await deleteDocument(tenantId, Number(id));
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
