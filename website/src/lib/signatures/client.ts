export type { SignatureSummary } from "@/lib/signatures/api/store";
export type { WallEntry, WallPage } from "@/lib/signatures/api/wall";

import type { SignatureSummary } from "@/lib/signatures/api/store";
import type { WallPage } from "@/lib/signatures/api/wall";

export interface SignaturePayload {
  name: string;
  email: string;
  message: string;
  regionTop: string;
  regionSub: string;
  affiliation: string;
  namePublic: boolean;
  agreePrivacy: boolean;
  agreeAge: boolean;
}

const NETWORK_ERROR_MESSAGE = "네트워크 연결을 확인해주세요.";

// 서버가 4xx/5xx에 실어 보내는 `error` 문구 중, 시민에게 그대로 보여줘도 되는
// 상태 코드만 화이트리스트로 신뢰한다(409 중복 서명, 429 요청 과다, 503 서비스
// 점검 — 전부 api/responses.ts·api/store.ts가 한국어로 작성해둔 문구다).
// 그 외(400 JSON 파싱 실패, 500 등)는 "Failed to submit signature" 같은 서버
// 로그·개발자용 영어 문구가 그대로 노출될 수 있어 한국어 폴백을 쓴다. 서버 쪽
// 상수 자체는 로그·다른 가드가 이름을 참조하므로 여기서 건드리지 않는다.
const TRUSTED_ERROR_STATUS = new Set([409, 429, 503]);

async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
  if (!TRUSTED_ERROR_STATUS.has(response.status)) {
    return fallback;
  }

  const data = await response.json().catch(() => null);
  return data && typeof data === "object" && "error" in data && typeof data.error === "string"
    ? data.error
    : fallback;
}

export async function submitSignature(
  payload: SignaturePayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // 이 함수는 예외를 던지지 않는 판별 유니온 계약(`{ok:true}|{ok:false,error}`)을
  // 약속한다. 오프라인·DNS 실패 등으로 fetch() 자체가 reject하는 경로까지
  // 포함해 전체를 감싼다 — 농촌·모바일 환경이 많은 캠페인 사이트라 실제로
  // 밟히는 경로다. 호출부가 이 계약을 믿고 try/catch를 생략해도 안전하다.
  try {
    const response = await fetch("/api/signatures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, error: await readApiErrorMessage(response, "서명 제출에 실패했습니다.") };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: NETWORK_ERROR_MESSAGE };
  }
}

export async function fetchSignatureSummary(): Promise<SignatureSummary> {
  const response = await fetch("/api/signatures");
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "서명 현황을 불러오지 못했습니다."));
  }

  const data = await response.json();
  return {
    count: typeof data.count === "number" ? data.count : 0,
    regionCount: typeof data.regionCount === "number" ? data.regionCount : 0,
    recent24h: typeof data.recent24h === "number" ? data.recent24h : 0,
    goal: typeof data.goal === "number" ? data.goal : 0,
  };
}

export async function fetchSignatureWall(cursor: string | null = null): Promise<WallPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await fetch(`/api/signatures/wall${query}`);
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "명단을 불러오지 못했습니다."));
  }

  const data = await response.json();
  return {
    entries: Array.isArray(data.entries) ? data.entries : [],
    nextCursor: typeof data.nextCursor === "string" ? data.nextCursor : null,
  };
}
