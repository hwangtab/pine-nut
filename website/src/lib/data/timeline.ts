import { createSupabaseServerClient } from "@/lib/supabase-server";
import { timelineEvents as fallbackTimeline, type TimelineEvent } from "@/data/timeline";
import {
  formatSupabaseRelationWarning,
  isMissingSupabaseRelationError,
} from "@/lib/supabase-errors";

interface TimelineRow {
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
  created_at: string;
  updated_at: string;
}

export interface AdminTimelineListResult {
  items: (TimelineEvent & { sortOrder: number; isDeleted: boolean })[];
  total: number;
  usingFallback: boolean;
  warning: string | null;
}

function buildFallbackTimelineResult(
  from: number,
  to: number,
  query?: string,
): AdminTimelineListResult {
  let items = fallbackTimeline.map((event, index) => ({
    ...event,
    sortOrder: index,
    isDeleted: false,
  }));

  if (query) {
    items = items.filter((event) => event.title.includes(query));
  }

  return {
    items: items.slice(from, to + 1),
    total: items.length,
    usingFallback: true,
    warning: formatSupabaseRelationWarning("timeline_events", "타임라인"),
  };
}

function rowToTimelineEvent(row: TimelineRow): TimelineEvent & { sortOrder: number } {
  return {
    id: row.id,
    date: row.date,
    year: row.year,
    title: row.title,
    description: row.description,
    category: row.category as TimelineEvent["category"],
    imageUrl: row.image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    sortOrder: row.sort_order,
  };
}

export async function getPublishedTimeline(): Promise<TimelineEvent[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fallbackTimeline;
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("is_deleted", false)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch published timeline:", error);
    return fallbackTimeline;
  }
  return data.map(rowToTimelineEvent);
}

export async function getAllTimeline(
  options?: { page?: number; perPage?: number; query?: string },
): Promise<AdminTimelineListResult> {
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 20;
  const query = options?.query?.trim();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return buildFallbackTimelineResult(from, to, query);
  }

  let countQuery = supabase.from("timeline_events").select("*", { count: "exact", head: true });
  let dataQuery = supabase.from("timeline_events").select("*").order("sort_order", { ascending: true }).range(from, to);

  if (query) {
    countQuery = countQuery.ilike("title", `%${query}%`);
    dataQuery = dataQuery.ilike("title", `%${query}%`);
  }

  const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery]);

  if (error || !data) {
    console.error("Failed to fetch admin timeline list:", error);
    const fallback = buildFallbackTimelineResult(from, to, query);
    return {
      ...fallback,
      warning: isMissingSupabaseRelationError(error)
        ? formatSupabaseRelationWarning("timeline_events", "타임라인")
        : "타임라인 데이터를 불러오지 못해 임시 데이터를 표시하고 있습니다.",
    };
  }
  return {
    items: data.map((row: TimelineRow) => ({ ...rowToTimelineEvent(row), isDeleted: row.is_deleted })),
    total: count ?? 0,
    usingFallback: false,
    warning: null,
  };
}

export async function getTimelineById(id: number): Promise<(TimelineEvent & { sortOrder: number }) | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(`Failed to fetch timeline by id (${id}):`, error);
    return null;
  }
  return rowToTimelineEvent(data);
}
