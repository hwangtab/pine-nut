"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 감사 로그를 남긴다.
 *
 * user_email은 DB 함수가 세션 JWT에서 직접 채운다. 클라이언트가 신원을 지정할 수
 * 없으므로 "다른 사람이 한 것처럼" 위조할 수 없다.
 *
 * 기록 실패는 본 작업을 중단시키지 않지만, 조용히 넘기면 "남고 있다"는 착각을
 * 만든다. 실패는 서버 로그에 남겨 추적 가능하게 한다.
 */
export async function logAudit(
  supabase: SupabaseClient,
  tableName: string,
  recordId: number,
  action: "create" | "update" | "delete" | "restore" | "bulk_update",
  options?: {
    entityKey?: string;
    payload?: Record<string, unknown>;
  },
) {
  try {
    const { error } = await supabase.rpc("log_audit", {
      p_table_name: tableName,
      p_record_id: recordId,
      p_action: action,
      p_entity_key: options?.entityKey ?? null,
      p_payload: options?.payload ?? null,
    });
    if (!error) return;

    // 함수가 아직 배포되지 않은 환경에서만 예전 직접 INSERT 경로로 폴백한다.
    const missingFunction =
      error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
    if (!missingFunction) {
      console.error("logAudit: rpc failed", tableName, action, error.message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;
    const { error: insertError } = await supabase.from("audit_log").insert({
      table_name: tableName,
      record_id: recordId,
      action,
      user_email: user.email,
      entity_key: options?.entityKey ?? null,
      payload: options?.payload ?? null,
    });
    if (insertError) {
      console.error("logAudit: insert fallback failed", tableName, action, insertError.message);
    }
  } catch (e) {
    console.error("logAudit: unexpected failure", tableName, action, e);
  }
}
