import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SignatureSummary,
  SubmitSignatureResult,
} from "@/lib/signatures/client";
import {
  DUPLICATE_SIGNATURE_MESSAGE,
  RATE_LIMIT_MAX,
  RATE_LIMIT_MESSAGE,
  RATE_LIMIT_WINDOW_MS,
} from "./config";
import { hashIp } from "./request";
import { SignatureApiError } from "./responses";
import type { ValidSignatureSubmission } from "./validation";

function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

export async function fetchSignatureSummary(
  supabase: SupabaseClient,
): Promise<SignatureSummary> {
  const { count, error: countError } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;

  const { data: signatures, error: signatureError } = await supabase
    .from("signatures")
    .select("name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (signatureError) throw signatureError;

  return {
    count: count || 0,
    signatures: (signatures || []).map((signature) => ({
      name: maskName(signature.name),
      message: signature.message || "",
      created_at: signature.created_at,
    })),
    demo: false,
  };
}

export async function submitSignatureToStore(
  supabase: SupabaseClient,
  submission: ValidSignatureSubmission,
  ip: string,
): Promise<SubmitSignatureResult> {
  const ipHash = hashIp(ip);
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
    name: submission.name,
    email: submission.normalizedEmail,
    message: submission.messageText,
    ip_hash: ipHash,
    consent_privacy: submission.agreePrivacy,
    consent_age: submission.agreeAge,
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

  const { count, error: countError } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;

  return {
    success: true,
    count: count || 0,
    demo: false,
  };
}
