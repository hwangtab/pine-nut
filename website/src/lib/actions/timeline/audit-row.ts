import type { AuthenticatedActionClient } from "@/lib/actions/auth";

export const TIMELINE_AUDIT_SELECT =
  "id, date, year, title, description, category, image_url, image_alt, sort_order, is_deleted";

export interface TimelineAuditRow {
  id: number;
  date: string;
  year: number;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  image_alt: string | null;
  sort_order: number;
  is_deleted: boolean;
}

export async function getTimelineAuditRow(
  supabase: AuthenticatedActionClient,
  id: number,
): Promise<TimelineAuditRow | null> {
  const { data } = await supabase
    .from("timeline_events")
    .select(TIMELINE_AUDIT_SELECT)
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

export function parseTimelineAuditRow(
  payload: Record<string, unknown> | null | undefined,
): TimelineAuditRow | null {
  const raw = payload?.before;
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  return {
    id: typeof row.id === "number" ? row.id : 0,
    date: typeof row.date === "string" ? row.date : "",
    year: typeof row.year === "number" ? row.year : 0,
    title: typeof row.title === "string" ? row.title : "",
    description: typeof row.description === "string" ? row.description : "",
    category: typeof row.category === "string" ? row.category : "",
    image_url: typeof row.image_url === "string" ? row.image_url : null,
    image_alt: typeof row.image_alt === "string" ? row.image_alt : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_deleted: row.is_deleted === true,
  };
}
