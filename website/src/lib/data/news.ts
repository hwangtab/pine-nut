import { createSupabaseServerClient } from "@/lib/supabase-server";
import { newsItems as fallbackNews, type NewsItem } from "@/data/news";

interface NewsRow {
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
  created_at: string;
  updated_at: string;
}

function rowToNewsItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    date: row.date,
    category: row.category as NewsItem["category"],
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    thumbnailUrl: row.thumbnail_url ?? undefined,
  };
}

export async function getPublishedNews(): Promise<NewsItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [...fallbackNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_deleted", false)
    .order("date", { ascending: false });

  if (error || !data) return [...fallbackNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return data.map(rowToNewsItem);
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackNews.find((n) => n.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("is_deleted", false)
    .single();

  if (error || !data) return fallbackNews.find((n) => n.slug === slug) ?? null;
  return rowToNewsItem(data);
}

export async function getAllNews(): Promise<(NewsItem & { isDeleted: boolean })[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackNews.map((n) => ({ ...n, isDeleted: false }));

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false });

  if (error || !data) return fallbackNews.map((n) => ({ ...n, isDeleted: false }));
  return data.map((row: NewsRow) => ({ ...rowToNewsItem(row), isDeleted: row.is_deleted }));
}

export async function getNewsById(id: number): Promise<NewsItem | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackNews.find((n) => n.id === id) ?? null;

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToNewsItem(data);
}
