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

export async function getAllNews(options?: { page?: number; perPage?: number; query?: string }): Promise<{ items: (NewsItem & { isDeleted: boolean })[]; total: number }> {
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 20;
  const query = options?.query?.trim();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    let items = fallbackNews.map((n) => ({ ...n, isDeleted: false }));
    if (query) items = items.filter((n) => n.title.includes(query));
    return { items: items.slice(from, to + 1), total: items.length };
  }

  let countQuery = supabase.from("news").select("*", { count: "exact", head: true });
  let dataQuery = supabase.from("news").select("*").order("date", { ascending: false }).range(from, to);

  if (query) {
    countQuery = countQuery.ilike("title", `%${query}%`);
    dataQuery = dataQuery.ilike("title", `%${query}%`);
  }

  const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery]);

  if (error || !data) {
    const items = fallbackNews.map((n) => ({ ...n, isDeleted: false }));
    return { items: items.slice(from, to + 1), total: items.length };
  }
  return {
    items: data.map((row: NewsRow) => ({ ...rowToNewsItem(row), isDeleted: row.is_deleted })),
    total: count ?? 0,
  };
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
