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

export async function getAuditEntries(
  limit = 100,
  tableName?: string,
): Promise<AuditEntry[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase.from("audit_log").select("*");
  if (tableName) query = query.eq("table_name", tableName);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    // created_at이 같은 행이 생길 수 있다(같은 저장의 여러 기록). id로 순서를 확정한다.
    .order("id", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as AuditEntry[];
}

/** 히스토리 화면에서 복원 대상이 되는 테이블들. */
export const RESTORABLE_AUDIT_TABLES = [
  "page_content",
  "news",
  "timeline_events",
] as const;

/**
 * 전체 최신 N건만 읽으면, 기록이 많은 page_content가 나머지를 밀어내
 * 소식·타임라인의 복원 지점이 화면에서 조용히 사라진다.
 * 테이블별로 각각 최신 N건을 읽어 합친다.
 */
export async function getAuditEntriesForHistory(
  perTable = 100,
  overallLimit = 150,
): Promise<AuditEntry[]> {
  const [overall, ...perTableResults] = await Promise.all([
    getAuditEntries(overallLimit),
    ...RESTORABLE_AUDIT_TABLES.map((table) => getAuditEntries(perTable, table)),
  ]);

  const byId = new Map<number, AuditEntry>();
  for (const entry of [...overall, ...perTableResults.flat()]) {
    byId.set(entry.id, entry);
  }

  return [...byId.values()].sort((a, b) => {
    const diff = b.created_at.localeCompare(a.created_at);
    return diff !== 0 ? diff : b.id - a.id;
  });
}
