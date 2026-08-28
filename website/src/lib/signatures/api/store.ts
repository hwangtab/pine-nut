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
}

export async function fetchSignatureSummary(
  supabase: SupabaseClient,
): Promise<SignatureSummary> {
  const { count, error: countError } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;

  const { data: regionRows, error: regionError } = await supabase
    .from("signatures")
    .select("region_top");

  if (regionError) throw regionError;

  const regionCount = new Set(
    (regionRows || [])
      .map((row: { region_top: string | null }) => row.region_top)
      .filter((value: string | null): value is string => Boolean(value)),
  ).size;

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
