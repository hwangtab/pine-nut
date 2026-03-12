import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface AuditEntry {
  id: number;
  table_name: string;
  record_id: number;
  action: "create" | "update" | "delete" | "restore" | "bulk_update";
  user_email: string;
  created_at: string;
  entity_key?: string | null;
  payload?: Record<string, unknown> | null;
}

export async function getAuditEntries(limit = 100): Promise<AuditEntry[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as AuditEntry[];
}
