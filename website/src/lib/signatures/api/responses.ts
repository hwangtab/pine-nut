import { NextResponse } from "next/server";
import { isMissingSupabaseRelationError } from "@/lib/supabase-errors";
import { SERVICE_UNAVAILABLE_MESSAGE } from "./config";

export class SignatureApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function missingSignatureServiceResponse() {
  return NextResponse.json({ error: SERVICE_UNAVAILABLE_MESSAGE }, { status: 503 });
}

export function jsonErrorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function signatureApiErrorResponse(
  logMessage: string,
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof SignatureApiError) {
    return jsonErrorResponse(error.message, error.status);
  }

  console.error(logMessage, error);
  if (isMissingSupabaseRelationError(error)) {
    return missingSignatureServiceResponse();
  }

  return jsonErrorResponse(fallbackMessage, 500);
}
