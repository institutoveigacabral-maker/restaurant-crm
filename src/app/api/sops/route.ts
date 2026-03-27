import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sops } from "@/db/schema";
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
    .from(sops)
    .where(eq(sops.tenantId, tenantId))
    .orderBy(desc(sops.updatedAt));

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
    .insert(sops)
    .values({
      tenantId,
      title: body.title,
      category: body.category,
      content: body.content || "",
      status: body.status || "draft",
      createdBy: user.id,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
