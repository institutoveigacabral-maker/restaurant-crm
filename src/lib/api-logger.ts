import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

export function withLogging(
  handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const start = Date.now();
    const method = req.method;
    const url = req.url;

    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - start;

      logger.info("API Request", {
        method,
        url,
        status: response.status,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error("API Request Failed", {
        method,
        url,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };
}
