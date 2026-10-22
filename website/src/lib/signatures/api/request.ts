import { createHash, createHmac } from "crypto";
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

// 클라이언트 IP: Vercel이 직접 붙이는 x-vercel-forwarded-for를 가장 먼저 믿는다
// (x-forwarded-for는 클라이언트가 앞에 임의 값을 끼워 넣을 수 있다). 그다음 x-forwarded-for
// 첫 홉, x-real-ip 순. NextRequest와 next/headers의 headers() 모두 받도록 Headers로 받는다.
export function getClientIpFromHeaders(headers: Headers): string {
  const firstHop = (name: string) => headers.get(name)?.split(",")[0]?.trim() || "";
  return (
    firstHop("x-vercel-forwarded-for") ||
    firstHop("x-forwarded-for") ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function getClientIp(request: NextRequest): string {
  return getClientIpFromHeaders(request.headers);
}

let missingPepperLogged = false;

// IPv4 전체 공간은 43억 개뿐이라 비밀값 없는 sha256(ip)는 전수 대입으로 바로 되돌려진다.
// 서버 전용 비밀값 IP_HASH_PEPPER로 HMAC-SHA256을 건다. 비밀값이 없으면 서명 접수를 막지
// 않도록 평문 sha256으로 물러서되, 프로덕션에서는 설정 누락을 에러 로그로 남긴다.
// (해시 방식이 바뀌면 기존 ip_hash와 값이 달라져 IP 단위 제한 창이 한 번 초기화된다.)
export function hashIp(ip: string): string {
  const pepper = process.env.IP_HASH_PEPPER;
  if (pepper) return createHmac("sha256", pepper).update(ip).digest("hex");
  if (process.env.NODE_ENV === "production" && !missingPepperLogged) {
    missingPepperLogged = true;
    console.error("hashIp: IP_HASH_PEPPER is not set — falling back to unkeyed sha256 (reversible over IPv4).");
  }
  return createHash("sha256").update(ip).digest("hex");
}
