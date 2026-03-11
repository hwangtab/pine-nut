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

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function sortFallbackNews() {
  return [...fallbackNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function fallbackOrThrow<T>(fallbackFactory: () => T, errorMessage: string): T {
  if (IS_PRODUCTION) {
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  return fallbackFactory();
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
  if (!supabase) {
    return fallbackOrThrow(sortFallbackNews, "Supabase is not configured in production for published news.");
  }

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_deleted", false)
    .order("date", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch published news:", error);
    return fallbackOrThrow(sortFallbackNews, "Failed to fetch published news from Supabase.");
  }
  return data.map(rowToNewsItem);
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fallbackOrThrow(() => fallbackNews.find((n) => n.slug === slug) ?? null, "Supabase is not configured in production for news detail.");
  }

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("is_deleted", false)
    .single();

  if (error || !data) {
    console.error(`Failed to fetch news by slug (${slug}):`, error);
    return fallbackOrThrow(() => fallbackNews.find((n) => n.slug === slug) ?? null, `Failed to fetch news by slug from Supabase: ${slug}`);
  }
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
    return fallbackOrThrow(() => {
      let items = fallbackNews.map((n) => ({ ...n, isDeleted: false }));
      if (query) items = items.filter((n) => n.title.includes(query));
      return { items: items.slice(from, to + 1), total: items.length };
    }, "Supabase is not configured in production for admin news list.");
  }

  let countQuery = supabase.from("news").select("*", { count: "exact", head: true });
  let dataQuery = supabase.from("news").select("*").order("date", { ascending: false }).range(from, to);

  if (query) {
    countQuery = countQuery.ilike("title", `%${query}%`);
    dataQuery = dataQuery.ilike("title", `%${query}%`);
  }

  const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery]);

  if (error || !data) {
    console.error("Failed to fetch admin news list:", error);
    return fallbackOrThrow(() => {
      const items = fallbackNews.map((n) => ({ ...n, isDeleted: false }));
      return { items: items.slice(from, to + 1), total: items.length };
    }, "Failed to fetch admin news list from Supabase.");
  }
  return {
    items: data.map((row: NewsRow) => ({ ...rowToNewsItem(row), isDeleted: row.is_deleted })),
    total: count ?? 0,
  };
}

export async function getNewsById(id: number): Promise<NewsItem | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fallbackOrThrow(() => fallbackNews.find((n) => n.id === id) ?? null, `Supabase is not configured in production for news id: ${id}`);
  }

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(`Failed to fetch news by id (${id}):`, error);
    return fallbackOrThrow(() => null, `Failed to fetch news by id from Supabase: ${id}`);
  }
  return rowToNewsItem(data);
}
