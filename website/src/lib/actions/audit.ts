"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  tableName: string,
  recordId: number,
  action: "create" | "update" | "delete" | "restore" | "bulk_update",
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return;

  try {
    await supabase.from("audit_log").insert({
      table_name: tableName,
      record_id: recordId,
      action,
      user_email: user.email,
    });
  } catch {
    // 감사 로그 실패가 본 작업을 중단시키지 않도록 함
  }
}
