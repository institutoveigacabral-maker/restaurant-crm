import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBadges, awardBadge } from "@/services/gamification";
import { handleApiError } from "@/lib/api-utils";
import { badgeAwardSchema } from "@/lib/validations/gamification";

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

    const result = await getBadges(tenantId, userId);
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
    const validated = badgeAwardSchema.parse(body);

    const result = await awardBadge(tenantId, validated.userId, validated.badgeId);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
