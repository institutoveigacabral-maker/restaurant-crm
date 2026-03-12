import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

interface VitalsMetric {
  name: string;
  value: number;
  rating: string;
  id: string;
}

export async function POST(req: NextRequest) {
  try {
    const metric = (await req.json()) as VitalsMetric;

    logger.info("Web Vital", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
