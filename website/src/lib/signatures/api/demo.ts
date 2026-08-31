import { RATE_LIMIT_MAX, RATE_LIMIT_MESSAGE, RATE_LIMIT_WINDOW_MS, SIGNATURE_GOAL } from "./config";
import type { SignatureSubmitMode, SignatureSummary } from "./store";

interface DemoRateLimitEntry {
  count: number;
  resetAt: number;
}

interface DemoSignatureSubmitSuccess {
  ok: true;
  // Supabase 없이 도는 로컬 개발 경로도 실제 응답과 같은 모양을 돌려준다 —
  // 데모에는 저장소가 없어 갱신 판정을 할 수 없으므로 항상 "created"다.
  mode: SignatureSubmitMode;
}

interface DemoSignatureSubmitError {
  ok: false;
  error: string;
  status: 429;
}

const devRateLimitMap = new Map<string, DemoRateLimitEntry>();

function isRateLimitedInDemoMode(ip: string): boolean {
  const now = Date.now();
  const entry = devRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    devRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export function getDemoSignatureSummary(): SignatureSummary {
  return {
    count: 2847,
    regionCount: 17,
    recent24h: 42,
    goal: SIGNATURE_GOAL,
    demo: true,
  };
}

export function submitDemoSignature(
  ip: string,
): DemoSignatureSubmitSuccess | DemoSignatureSubmitError {
  if (isRateLimitedInDemoMode(ip)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE, status: 429 };
  }

  return { ok: true, mode: "created" };
}
