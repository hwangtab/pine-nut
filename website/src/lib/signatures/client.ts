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

// 서버 응답 바디의 `error` 필드는 항상 신뢰한다 — api/config.ts의 사용자
// 노출 상수는 전부 한국어다(가드 signature-form:refactor:check가 단언한다).
// 바디가 없거나 파싱 실패·`error` 필드 부재일 때만 아래 fallback을 쓴다.
// (이전 리비전에서 상태 코드 화이트리스트로 400/500을 걸러 폴백만 쓰게
// 했었는데, 그러면 서버가 이미 한국어로 만들어둔 구체적 문구
// — "이름을 입력해주세요.", "거주 지역을 선택해주세요." 등 — 까지 전부
// 일반 폴백 문구에 덮여 사라졌다. 진짜 문제는 상태 코드가 아니라 상수 값이
// 영어였다는 것이었고, 그건 api/config.ts에서 고쳤다.)
async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
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
  } catch (err) {
    console.error("submitSignature: network request failed", err);
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
