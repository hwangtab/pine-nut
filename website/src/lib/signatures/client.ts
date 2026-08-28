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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  return data && typeof data === "object" && "error" in data && typeof data.error === "string"
    ? data.error
    : fallback;
}

export async function submitSignature(
  payload: SignaturePayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch("/api/signatures", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { ok: false, error: await readApiErrorMessage(response, "서명 제출에 실패했습니다.") };
  }

  return { ok: true };
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
