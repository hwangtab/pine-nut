import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DUPLICATE_SIGNATURE_MESSAGE,
  RATE_LIMIT_MAX,
  RATE_LIMIT_MESSAGE,
  RATE_LIMIT_WINDOW_MS,
  SIGNATURE_GOAL,
  SIGNATURE_NAME_MISMATCH_MESSAGE,
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

/**
 * 재서명 처리 결과.
 * - `created`: 새 서명이 접수됐다.
 * - `updated`: 같은 이메일의 기존 서명을 마지막 제출값으로 갱신했다.
 *   총 서명 수는 늘지 않는다 — 성공 화면이 "N번째로 함께해주셨습니다"를
 *   그대로 띄우면 안 되는 이유다.
 */
export type SignatureSubmitMode = "created" | "updated";

export async function submitSignatureToStore(
  supabase: SupabaseClient,
  value: ValidSignatureSubmission,
  ipHash: string,
): Promise<SignatureSubmitMode> {
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

  // INSERT를 직접 쓰지 않고 submit_signature RPC를 거친다. 같은 이메일로 다시
  // 서명하면 기존 행을 마지막 제출값으로 갱신해야 하는데, 앱에서 "SELECT 후
  // 있으면 UPDATE"로 나누면 동시 요청 둘이 모두 "없음"을 보고 하나가 23505로
  // 죽는다. RPC 안의 INSERT ... ON CONFLICT DO UPDATE가 이를 한 문장으로
  // 처리한다(20260831000000_signature_resign_upsert.sql).
  const { data, error: submitError } = await supabase.rpc("submit_signature", {
    p_name: value.name,
    p_email: value.normalizedEmail,
    p_message: value.messageText,
    p_region_top: value.regionTop,
    p_region_sub: value.regionSub,
    p_affiliation: value.affiliation,
    p_name_public: value.namePublic,
    p_ip_hash: ipHash,
    p_consent_privacy: value.agreePrivacy,
    p_consent_age: value.agreeAge,
  });

  if (submitError) {
    // 이메일 유일 인덱스 충돌은 이제 RPC 안에서 갱신으로 흡수되므로 여기까지
    // 오지 않는다. 다른 유일 제약이 추가됐을 때를 대비해 남겨둔다 — 사라진
    // 분기가 아니라 도달하면 안 되는 분기다.
    if (submitError.code === "23505") {
      throw new SignatureApiError(DUPLICATE_SIGNATURE_MESSAGE, 409);
    }
    if (
      submitError.code === "P0001" &&
      submitError.message.includes("rate_limit_exceeded")
    ) {
      throw new SignatureApiError(RATE_LIMIT_MESSAGE, 429);
    }
    // 같은 이메일의 서명은 있는데 이름이 다르다 — 갱신을 거절한 경우.
    if (
      submitError.code === "P0001" &&
      submitError.message.includes("signature_name_mismatch")
    ) {
      throw new SignatureApiError(SIGNATURE_NAME_MISMATCH_MESSAGE, 409);
    }
    throw submitError;
  }

  return data === "updated" ? "updated" : "created";
}
