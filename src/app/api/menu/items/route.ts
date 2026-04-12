import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { menuItemSchema, menuItemUpdateSchema } from "@/lib/validations/menu";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  softDeleteMenuItem,
  toggleMenuItemAvailability,
} from "@/services/menu";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const data = await getAllMenuItems(tenantId);
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
    const validated = menuItemSchema.parse(body);
    const item = await createMenuItem(tenantId, validated);

    return successResponse(item, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const body = await req.json();

    // Check if this is a toggle availability request
    if (body.toggleAvailability && body.id) {
      const item = await toggleMenuItemAvailability(tenantId, Number(body.id));
      return successResponse(item);
    }

    const validated = menuItemUpdateSchema.parse(body);
    const item = await updateMenuItem(tenantId, validated);

    return successResponse(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return errorResponse("ID inválido");

    await softDeleteMenuItem(tenantId, id);

    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
