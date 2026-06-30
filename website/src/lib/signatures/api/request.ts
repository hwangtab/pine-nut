import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import type { SignatureSubmissionBody } from "./validation";

interface ReadSignatureRequestBodySuccess {
  ok: true;
  body: SignatureSubmissionBody;
}

interface ReadSignatureRequestBodyError {
  ok: false;
}

export async function readSignatureRequestBody(
  request: NextRequest,
): Promise<ReadSignatureRequestBodySuccess | ReadSignatureRequestBodyError> {
  try {
    return { ok: true, body: (await request.json()) as SignatureSubmissionBody };
  } catch {
    return { ok: false };
  }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}
