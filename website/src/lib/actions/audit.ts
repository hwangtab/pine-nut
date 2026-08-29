"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 감사 로그를 남긴다.
 *
 * user_email은 DB 함수가 세션 JWT에서 직접 채운다. 클라이언트가 신원을 지정할 수
 * 없으므로 "다른 사람이 한 것처럼" 위조할 수 없다.
 *
 * 기록 실패는 대부분의 호출부에서 본 작업을 중단시키지 않는다(콘텐츠 저장 같은
 * 작업까지 감사 로그 하나 때문에 막을 필요는 없다는 판단) — 조용히 넘기면 "남고
 * 있다"는 착각을 만들 뿐이므로 실패는 서버 로그에 남겨 추적 가능하게 한다.
 *
 * 반환값(true=기록 성공)은 "기록 자체가 목적"인 호출부(예: 개인정보 대량 내보내기)가
 * 실패를 스스로 감지해 fail-closed로 막을 수 있게 한다. 기존 호출부 대부분은 이
 * 반환값을 무시해도 되고(그래도 동작은 그대로), 그래서 시그니처를 바꿔도 안전하다.
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
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("log_audit", {
      p_table_name: tableName,
      p_record_id: recordId,
      p_action: action,
      p_entity_key: options?.entityKey ?? null,
      p_payload: options?.payload ?? null,
    });
    if (!error) return true;

    // 함수가 아직 배포되지 않은 환경에서만 예전 직접 INSERT 경로로 폴백한다.
    const missingFunction =
      error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
    if (!missingFunction) {
      console.error("logAudit: rpc failed", tableName, action, error.message);
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      console.error(
        "logAudit: fallback insert skipped — no authenticated user email",
        tableName,
        action,
      );
      return false;
    }
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
      return false;
    }
    return true;
  } catch (e) {
    console.error("logAudit: unexpected failure", tableName, action, e);
    return false;
  }
}
