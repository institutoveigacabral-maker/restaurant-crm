import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/services/gamification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await getLeaderboard(limit);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
