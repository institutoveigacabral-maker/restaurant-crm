import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateProgress } from "@/services/training";
import { handleApiError } from "@/lib/api-utils";
import { enrollmentUpdateSchema } from "@/lib/validations/training";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });

    const tenantId = session.user.tenantId;
    if (!tenantId)
      return NextResponse.json({ success: false, error: "No tenant" }, { status: 400 });

    const { id } = await params;
    const body = await req.json();
    const validated = enrollmentUpdateSchema.parse(body);

    const result = await updateProgress(tenantId, Number(id), validated.progress, validated.score);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return handleApiError(err);
  }
}
