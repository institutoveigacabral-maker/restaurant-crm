import { NextRequest, NextResponse } from "next/server";
import { getOrCreateProfile } from "@/services/gamification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId") || "admin-user-id";

    const result = await getOrCreateProfile(userId);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
