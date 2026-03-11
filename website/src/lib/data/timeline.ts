import { createSupabaseServerClient } from "@/lib/supabase-server";
import { timelineEvents as fallbackTimeline, type TimelineEvent } from "@/data/timeline";

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

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function fallbackOrThrow<T>(fallbackFactory: () => T, errorMessage: string): T {
  if (IS_PRODUCTION) {
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  return fallbackFactory();
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
    return fallbackOrThrow(() => fallbackTimeline, "Supabase is not configured in production for published timeline.");
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("is_deleted", false)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch published timeline:", error);
    return fallbackOrThrow(() => fallbackTimeline, "Failed to fetch published timeline from Supabase.");
  }
  return data.map(rowToTimelineEvent);
}

export async function getAllTimeline(options?: { page?: number; perPage?: number; query?: string }): Promise<{ items: (TimelineEvent & { sortOrder: number; isDeleted: boolean })[]; total: number }> {
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 20;
  const query = options?.query?.trim();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fallbackOrThrow(() => {
      let items = fallbackTimeline.map((t, i) => ({ ...t, sortOrder: i, isDeleted: false }));
      if (query) items = items.filter((t) => t.title.includes(query));
      return { items: items.slice(from, to + 1), total: items.length };
    }, "Supabase is not configured in production for admin timeline list.");
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
    return fallbackOrThrow(() => {
      const items = fallbackTimeline.map((t, i) => ({ ...t, sortOrder: i, isDeleted: false }));
      return { items: items.slice(from, to + 1), total: items.length };
    }, "Failed to fetch admin timeline list from Supabase.");
  }
  return {
    items: data.map((row: TimelineRow) => ({ ...rowToTimelineEvent(row), isDeleted: row.is_deleted })),
    total: count ?? 0,
  };
}

export async function getTimelineById(id: number): Promise<(TimelineEvent & { sortOrder: number }) | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fallbackOrThrow(() => {
      const idx = fallbackTimeline.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      return { ...fallbackTimeline[idx], sortOrder: idx };
    }, `Supabase is not configured in production for timeline id: ${id}`);
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(`Failed to fetch timeline by id (${id}):`, error);
    return fallbackOrThrow(() => null, `Failed to fetch timeline by id from Supabase: ${id}`);
  }
  return rowToTimelineEvent(data);
}
