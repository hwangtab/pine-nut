import { cache } from "react";
import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { newsItems as fallbackNews, type NewsItem, type NewsSummary } from "@/data/news";

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

export type { NewsSummary };

const NEWS_SUMMARY_COLUMNS =
  "id,slug,title,summary,date,category,source_url,source_name,thumbnail_url";

type NewsSummaryRow = Omit<NewsRow, "content" | "is_deleted" | "created_at" | "updated_at">;

function newsItemToSummary(item: NewsItem): NewsSummary {
  const { content, ...summary } = item;
  void content;
  return summary;
}

function rowToNewsSummary(row: NewsSummaryRow): NewsSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    date: row.date,
    category: row.category as NewsItem["category"],
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    thumbnailUrl: row.thumbnail_url ?? undefined,
  };
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

// 공개(비삭제) 콘텐츠만 읽는 경로는 쿠키를 읽지 않는 익명 클라이언트를 쓴다.
// createSupabaseServerClient()는 next/headers의 cookies()를 호출하고, 그 한 줄이
// 이 함수를 부르는 페이지를 요청마다 서버 렌더로 못박는다 — 방문자가 누구든
// 같은 기사·연혁을 보여주는 페이지들이 CDN 캐시에서 빠지는 이유였다.
// 삭제분까지 봐야 하는 관리자용 조회는 아래에서 계속 쿠키 클라이언트를 쓴다.
export async function getPublishedNews(): Promise<NewsItem[]> {
  const supabase = createSupabaseAnonClient();
  if (!supabase) {
    return fallbackOrThrow(sortFallbackNews, "Supabase is not configured in production for published news.");
  }

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_deleted", false)
    // date는 같은 날짜가 흔하다. id를 2차 키로 두어 순서를 결정적으로 만든다
    // (그러지 않으면 페이지네이션이 같은 행을 중복 노출하거나 건너뛴다).
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch published news:", error);
    return fallbackOrThrow(sortFallbackNews, "Failed to fetch published news from Supabase.");
  }
  return data.map(rowToNewsItem);
}

/**
 * 목록·이전글/다음글 전용 조회. getPublishedNews()와 정렬이 같고 본문만 빠진다.
 * 기사 수가 늘수록 본문 전량이 페이로드를 지배하므로, 본문을 그리는 상세
 * 페이지만 getPublishedNews()/getNewsBySlug()를 쓴다.
 */
export async function getPublishedNewsSummaries(): Promise<NewsSummary[]> {
  const supabase = createSupabaseAnonClient();
  if (!supabase) {
    return fallbackOrThrow(
      () => sortFallbackNews().map(newsItemToSummary),
      "Supabase is not configured in production for published news.",
    );
  }

  const { data, error } = await supabase
    .from("news")
    .select(NEWS_SUMMARY_COLUMNS)
    .eq("is_deleted", false)
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch published news summaries:", error);
    return fallbackOrThrow(
      () => sortFallbackNews().map(newsItemToSummary),
      "Failed to fetch published news summaries from Supabase.",
    );
  }
  return (data as unknown as NewsSummaryRow[]).map(rowToNewsSummary);
}

// 공개(비삭제) 콘텐츠만 읽는 경로는 쿠키를 읽지 않는 익명 클라이언트를 쓴다.
// createSupabaseServerClient()는 next/headers의 cookies()를 호출하고, 그 한 줄이
// 이 함수를 부르는 페이지를 요청마다 서버 렌더로 못박는다 — 방문자가 누구든
// 같은 기사·연혁을 보여주는 페이지들이 CDN 캐시에서 빠지는 이유였다.
// 삭제분까지 봐야 하는 관리자용 조회는 아래에서 계속 쿠키 클라이언트를 쓴다.
/**
 * 같은 요청 안에서 generateMetadata와 페이지 본문이 각각 호출한다. React.cache로
 * 감싸지 않으면 방문 1회마다 같은 SELECT가 두 번 나간다(supabase-js의 fetch는
 * Next의 요청 단위 중복 제거 대상이 아니다).
 */
export const getNewsBySlug = cache(async (slug: string): Promise<NewsItem | null> => {
  const supabase = createSupabaseAnonClient();
  if (!supabase) {
    return fallbackOrThrow(() => fallbackNews.find((n) => n.slug === slug) ?? null, "Supabase is not configured in production for news detail.");
  }

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch news by slug (${slug}):`, error);
    return fallbackOrThrow(() => fallbackNews.find((n) => n.slug === slug) ?? null, `Failed to fetch news by slug from Supabase: ${slug}`);
  }
  if (!data) {
    return IS_PRODUCTION ? null : fallbackNews.find((n) => n.slug === slug) ?? null;
  }
  return rowToNewsItem(data);
});

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
  let dataQuery = supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

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
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch news by id (${id}):`, error);
    return fallbackOrThrow(() => null, `Failed to fetch news by id from Supabase: ${id}`);
  }
  if (!data) {
    return IS_PRODUCTION ? null : fallbackNews.find((n) => n.id === id) ?? null;
  }
  return rowToNewsItem(data);
}
