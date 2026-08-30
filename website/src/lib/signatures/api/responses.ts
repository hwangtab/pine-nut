import { NextResponse } from "next/server";
import { isMissingSupabaseRelationError } from "@/lib/supabase-errors";
import { PUBLIC_READ_CACHE_CONTROL, SERVICE_UNAVAILABLE_MESSAGE } from "./config";

export class SignatureApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

// 공개 조회 성공 응답 전용. 오류 응답에는 절대 쓰지 않는다 — 일시적 장애가
// 엣지에 60초간 박제되면 그동안 모든 방문자가 같은 오류를 보게 된다.
export function cachedPublicJsonResponse(body: unknown) {
  return NextResponse.json(body, {
    headers: { "Cache-Control": PUBLIC_READ_CACHE_CONTROL },
  });
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
