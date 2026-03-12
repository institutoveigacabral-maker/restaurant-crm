import { NextRequest, NextResponse } from "next/server";
import { joinChallenge, updateProgress as updateChallengeProgress } from "@/services/challenges";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params;
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId") || "admin-user-id";

    const result = await joinChallenge(userId, Number(challengeId));
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
    const { id: challengeId } = await params;
    const body = await req.json();
    const { userId, progress } = body as { userId: string; progress: number };

    const effectiveUserId = userId || "admin-user-id";
    const result = await updateChallengeProgress(effectiveUserId, Number(challengeId), progress);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
