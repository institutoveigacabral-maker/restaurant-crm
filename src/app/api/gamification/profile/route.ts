import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateProfile } from "@/services/gamification";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });

    const tenantId = session.user.tenantId;
    if (!tenantId)
      return NextResponse.json({ success: false, error: "No tenant" }, { status: 400 });

    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId") || session.user.id!;

    const result = await getOrCreateProfile(tenantId, userId);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
