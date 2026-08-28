import { RATE_LIMIT_MAX, RATE_LIMIT_MESSAGE, RATE_LIMIT_WINDOW_MS, SIGNATURE_GOAL } from "./config";
import type { SignatureSummary } from "./store";

interface DemoRateLimitEntry {
  count: number;
  resetAt: number;
}

interface DemoSignatureSubmitSuccess {
  ok: true;
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

  return { ok: true };
}
