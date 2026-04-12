import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://redenexial.com",
  "https://restaurant-crm-iota.vercel.app",
];

export default auth((req) => {
  const response = NextResponse.next();
  const origin = req.headers.get("origin") ?? "";
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Tenant-Id"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  if (isApiRoute && req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
