import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { menuCategorySchema } from "@/lib/validations/menu";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getAllCategories, createCategory } from "@/services/menu";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const data = await getAllCategories(tenantId);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const body = await req.json();
    const validated = menuCategorySchema.parse(body);
    const category = await createCategory(tenantId, validated);

    return successResponse(category, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
