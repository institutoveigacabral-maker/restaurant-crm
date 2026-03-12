import { NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function validationErrorResponse(error: ZodError) {
  const issues: ZodIssue[] = error.issues;
  const messages = issues.map((e) => `${e.path.join(".")}: ${e.message}`);
  return NextResponse.json(
    { success: false, error: "Dados inválidos", details: messages },
    { status: 422 }
  );
}

export function handleApiError(error: unknown) {
  console.error("[API Error]", error);
  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }
  const message = error instanceof Error ? error.message : "Erro interno do servidor";
  return errorResponse(message, 500);
}
