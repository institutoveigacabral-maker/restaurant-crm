import { NextRequest, NextResponse } from "next/server";
import { updateProgress } from "@/services/training";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { progress, score } = body as { progress: number; score?: number };

    const result = await updateProgress(Number(id), progress, score);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
