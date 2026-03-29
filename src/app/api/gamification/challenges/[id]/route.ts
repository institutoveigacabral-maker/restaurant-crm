import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinChallenge, updateProgress as updateChallengeProgress } from "@/services/challenges";
import { handleApiError } from "@/lib/api-utils";
import { challengeProgressSchema } from "@/lib/validations/gamification";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId)
      return NextResponse.json({ success: false, error: "No tenant" }, { status: 400 });

    const { id: challengeId } = await params;
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId") || session.user.id!;

    const result = await joinChallenge(tenantId, userId, Number(challengeId));
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId)
      return NextResponse.json({ success: false, error: "No tenant" }, { status: 400 });

    const { id: challengeId } = await params;
    const body = await req.json();
    const validated = challengeProgressSchema.parse(body);

    const effectiveUserId = validated.userId || session.user.id!;
    const result = await updateChallengeProgress(
      tenantId,
      effectiveUserId,
      Number(challengeId),
      validated.progress
    );
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return handleApiError(err);
  }
}
