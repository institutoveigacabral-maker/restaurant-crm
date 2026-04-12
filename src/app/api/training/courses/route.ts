import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCourses, createCourse } from "@/services/training";
import { handleApiError } from "@/lib/api-utils";
import { courseCreateSchema } from "@/lib/validations/training";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });

    const tenantId = session.user.tenantId;
    if (!tenantId)
      return NextResponse.json({ success: false, error: "No tenant" }, { status: 400 });

    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    const result = await getCourses(tenantId, category, difficulty);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });

    const tenantId = session.user.tenantId;
    if (!tenantId)
      return NextResponse.json({ success: false, error: "No tenant" }, { status: 400 });

    const body = await req.json();
    const validated = courseCreateSchema.parse(body);
    const result = await createCourse(tenantId, validated);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
