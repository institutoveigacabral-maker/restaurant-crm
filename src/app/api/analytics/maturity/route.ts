import { auth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { db } from "@/db";
import { diagnostics } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

interface MaturityHistoryEntry {
  date: string;
  overallScore: number;
  scores: Record<string, number>;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Nao autorizado", 401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) return errorResponse("No tenant", 400);

    const allDiagnostics = await db
      .select({
        createdAt: diagnostics.createdAt,
        overallScore: diagnostics.overallScore,
        scores: diagnostics.scores,
      })
      .from(diagnostics)
      .where(eq(diagnostics.tenantId, tenantId))
      .orderBy(asc(diagnostics.createdAt));

    const history: MaturityHistoryEntry[] = allDiagnostics.map((d) => ({
      date: d.createdAt?.toISOString().split("T")[0] ?? "",
      overallScore: Number(d.overallScore ?? 0),
      scores: (d.scores as Record<string, number>) ?? {},
    }));

    let improvement = 0;
    let improvementPercent = "0%";

    if (history.length > 1) {
      const first = history[0].overallScore;
      const last = history[history.length - 1].overallScore;
      improvement = last - first;
      improvementPercent =
        first > 0
          ? `${improvement >= 0 ? "+" : ""}${Math.round((improvement / first) * 100)}%`
          : improvement > 0
            ? "+100%"
            : "0%";
    }

    return successResponse({ history, improvement, improvementPercent });
  } catch (error) {
    return handleApiError(error);
  }
}
