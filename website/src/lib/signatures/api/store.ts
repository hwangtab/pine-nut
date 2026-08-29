import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DUPLICATE_SIGNATURE_MESSAGE,
  RATE_LIMIT_MAX,
  RATE_LIMIT_MESSAGE,
  RATE_LIMIT_WINDOW_MS,
  SIGNATURE_GOAL,
} from "./config";
import { SignatureApiError } from "./responses";
import type { ValidSignatureSubmission } from "./validation";

export interface SignatureSummary {
  count: number;
  regionCount: number;
  recent24h: number;
  goal: number;
  demo?: boolean;
}

export async function fetchSignatureSummary(
  supabase: SupabaseClient,
): Promise<SignatureSummary> {
  const { count, error: countError } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;

  // region_top의 distinct count는 DB에서 집계한다 — select("region_top")로 전체
  // 테이블을 끌어오면 max_rows(1000, supabase/config.toml)에 걸려 서명이 1000건을
  // 넘는 순간 앞쪽 1000행만 조용히 반환되고 그 뒤로는 regionCount가 절대 늘지 않는다.
  const { data: regionCountResult, error: regionError } =
    await supabase.rpc("signature_region_count");

  if (regionError) throw regionError;

  const regionCount =
    typeof regionCountResult === "number" ? regionCountResult : 0;

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recent24h, error: recentError } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true })
    .gte("created_at", dayAgo);

  if (recentError) throw recentError;

  return {
    count: count || 0,
    regionCount,
    recent24h: recent24h || 0,
    goal: SIGNATURE_GOAL,
  };
}

export async function submitSignatureToStore(
  supabase: SupabaseClient,
  value: ValidSignatureSubmission,
  ipHash: string,
): Promise<void> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count: recentCount, error: rateLimitError } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (rateLimitError) throw rateLimitError;

  if ((recentCount || 0) >= RATE_LIMIT_MAX) {
    throw new SignatureApiError(RATE_LIMIT_MESSAGE, 429);
  }

  const { error: insertError } = await supabase.from("signatures").insert({
    name: value.name,
    email: value.normalizedEmail,
    message: value.messageText,
    region_top: value.regionTop,
    region_sub: value.regionSub,
    affiliation: value.affiliation,
    name_public: value.namePublic,
    ip_hash: ipHash,
    consent_privacy: value.agreePrivacy,
    consent_age: value.agreeAge,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      throw new SignatureApiError(DUPLICATE_SIGNATURE_MESSAGE, 409);
    }
    if (
      insertError.code === "P0001" &&
      insertError.message.includes("rate_limit_exceeded")
    ) {
      throw new SignatureApiError(RATE_LIMIT_MESSAGE, 429);
    }
    throw insertError;
  }
}
