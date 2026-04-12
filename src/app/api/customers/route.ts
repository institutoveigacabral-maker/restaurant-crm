import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { customerSchema, customerUpdateSchema } from "@/lib/validations/customer";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
} from "@/services/customers";
import { logActivity } from "@/services/activity";
import { onCustomerCreated } from "@/services/automation-engine";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const tenantId = session.user.tenantId;
    if (!tenantId) return errorResponse("No tenant", 400);

    const data = await getAllCustomers(tenantId);
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
    const validated = customerSchema.parse(body);
    const customer = await createCustomer(tenantId, validated);

    await logActivity(tenantId, session.user.id!, "create", "customer", customer.id, {
      name: validated.name,
    });

    // Trigger automation: welcome email
    onCustomerCreated(tenantId, { name: validated.name, email: validated.email }).catch(() => {});

    return successResponse(customer, 201);
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
    const validated = customerUpdateSchema.parse(body);
    const customer = await updateCustomer(tenantId, validated);

    await logActivity(tenantId, session.user.id!, "update", "customer", validated.id, {
      name: validated.name,
    });

    return successResponse(customer);
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

    const role = (session.user as Record<string, unknown>).role;
    if (role !== "admin" && role !== "gerente") {
      return errorResponse("Sem permissão para excluir", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return errorResponse("ID inválido");

    await softDeleteCustomer(tenantId, id);
    await logActivity(tenantId, session.user.id!, "delete", "customer", id);

    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
