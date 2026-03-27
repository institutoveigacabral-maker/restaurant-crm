import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { diagnostics } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantId = (session.user as any).tenantId as string;
  if (!tenantId) return NextResponse.json([]);

  const result = await db
    .select()
    .from(diagnostics)
    .where(eq(diagnostics.tenantId, tenantId))
    .orderBy(desc(diagnostics.createdAt));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  const tenantId = user.tenantId as string;
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await req.json();

  const result = await db
    .insert(diagnostics)
    .values({
      tenantId,
      createdBy: user.id,
      title: body.title,
      status: body.status || "draft",
      answers: body.answers || {},
      scores: body.scores || {},
      overallScore: body.overallScore?.toString() || null,
      report: body.report || null,
      completedAt: body.status === "completed" ? new Date() : null,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
