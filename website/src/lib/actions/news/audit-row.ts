import type { AuthenticatedActionClient } from "@/lib/actions/auth";

export const NEWS_AUDIT_SELECT =
  "id, slug, title, summary, content, date, category, source_url, source_name, thumbnail_url, is_deleted";

export interface NewsAuditRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  source_url: string;
  source_name: string;
  thumbnail_url: string | null;
  is_deleted: boolean;
}

export async function getNewsAuditRow(
  supabase: AuthenticatedActionClient,
  id: number,
): Promise<NewsAuditRow | null> {
  const { data } = await supabase
    .from("news")
    .select(NEWS_AUDIT_SELECT)
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

export function parseNewsAuditRow(
  payload: Record<string, unknown> | null | undefined,
): NewsAuditRow | null {
  const raw = payload?.before;
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  return {
    id: typeof row.id === "number" ? row.id : 0,
    slug: typeof row.slug === "string" ? row.slug : "",
    title: typeof row.title === "string" ? row.title : "",
    summary: typeof row.summary === "string" ? row.summary : "",
    content: typeof row.content === "string" ? row.content : "",
    date: typeof row.date === "string" ? row.date : "",
    category: typeof row.category === "string" ? row.category : "",
    source_url: typeof row.source_url === "string" ? row.source_url : "",
    source_name: typeof row.source_name === "string" ? row.source_name : "",
    thumbnail_url:
      typeof row.thumbnail_url === "string" ? row.thumbnail_url : null,
    is_deleted: row.is_deleted === true,
  };
}
