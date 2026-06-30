import type {
  SignatureSummary,
  SubmitSignatureResult,
} from "@/lib/signatures/client";
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_MESSAGE,
  RATE_LIMIT_WINDOW_MS,
} from "./config";

interface DemoRateLimitEntry {
  count: number;
  resetAt: number;
}

interface DemoSignatureSubmitSuccess {
  ok: true;
  body: SubmitSignatureResult;
}

interface DemoSignatureSubmitError {
  ok: false;
  error: string;
  status: 429;
}

const devRateLimitMap = new Map<string, DemoRateLimitEntry>();

const DEMO_SIGNATURES = [
  { name: "김*수", message: "풍천리 주민분들 힘내세요!", created_at: "2026-03-10T09:00:00Z" },
  { name: "박*영", message: "자연을 지키는 일에 함께합니다.", created_at: "2026-03-09T14:00:00Z" },
  { name: "이*현", message: "응원합니다. 끝까지 싸워주세요.", created_at: "2026-03-09T10:00:00Z" },
  { name: "정*미", message: "작은 힘이라도 보태고 싶습니다.", created_at: "2026-03-08T16:00:00Z" },
  { name: "최*호", message: "", created_at: "2026-03-08T11:00:00Z" },
];

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
    signatures: DEMO_SIGNATURES,
    demo: true,
  };
}

export function submitDemoSignature(
  ip: string,
): DemoSignatureSubmitSuccess | DemoSignatureSubmitError {
  if (isRateLimitedInDemoMode(ip)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE, status: 429 };
  }

  return {
    ok: true,
    body: {
      success: true,
      count: 2848,
      demo: true,
    },
  };
}
