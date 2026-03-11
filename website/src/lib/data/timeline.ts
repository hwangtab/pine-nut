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
  if (!supabase) return fallbackTimeline;

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("is_deleted", false)
    .order("sort_order", { ascending: true });

  if (error || !data) return fallbackTimeline;
  return data.map(rowToTimelineEvent);
}

export async function getAllTimeline(): Promise<(TimelineEvent & { sortOrder: number; isDeleted: boolean })[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackTimeline.map((t, i) => ({ ...t, sortOrder: i, isDeleted: false }));

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return fallbackTimeline.map((t, i) => ({ ...t, sortOrder: i, isDeleted: false }));
  return data.map((row: TimelineRow) => ({ ...rowToTimelineEvent(row), isDeleted: row.is_deleted }));
}

export async function getTimelineById(id: number): Promise<(TimelineEvent & { sortOrder: number }) | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const idx = fallbackTimeline.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    return { ...fallbackTimeline[idx], sortOrder: idx };
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToTimelineEvent(data);
}
