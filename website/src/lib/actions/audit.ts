"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  tableName: string,
  recordId: number,
  action: "create" | "update" | "delete" | "restore",
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return;

  await supabase.from("audit_log").insert({
    table_name: tableName,
    record_id: recordId,
    action,
    user_email: user.email,
  });
}
