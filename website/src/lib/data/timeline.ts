import { createSupabaseAnonClient } from "@/lib/supabase-anon";
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

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export interface AdminTimelineListResult {
  items: (TimelineEvent & { sortOrder: number; isDeleted: boolean })[];
  total: number;
  usingFallback: boolean;
  warning: string | null;
}

function fallbackOrThrow<T>(fallbackFactory: () => T, errorMessage: string): T {
  if (IS_PRODUCTION) {
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  return fallbackFactory();
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

// 공개(비삭제) 콘텐츠만 읽는 경로는 쿠키를 읽지 않는 익명 클라이언트를 쓴다.
// createSupabaseServerClient()는 next/headers의 cookies()를 호출하고, 그 한 줄이
// 이 함수를 부르는 페이지를 요청마다 서버 렌더로 못박는다 — 방문자가 누구든
// 같은 기사·연혁을 보여주는 페이지들이 CDN 캐시에서 빠지는 이유였다.
// 삭제분까지 봐야 하는 관리자용 조회는 아래에서 계속 쿠키 클라이언트를 쓴다.
export async function getPublishedTimeline(): Promise<TimelineEvent[]> {
  const supabase = createSupabaseAnonClient();
  if (!supabase) {
    return fallbackOrThrow(
      () => fallbackTimeline,
      "Supabase is not configured in production for published timeline.",
    );
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("is_deleted", false)
    // sort_order는 동시 등록 시 값이 겹칠 수 있다. id를 2차 키로 두어 순서를
    // 결정적으로 만든다(그러지 않으면 페이지네이션이 행을 중복/누락한다).
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch published timeline:", error);
    return fallbackOrThrow(
      () => fallbackTimeline,
      "Failed to fetch published timeline from Supabase.",
    );
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
    return fallbackOrThrow(
      () => buildFallbackTimelineResult(from, to, query),
      "Supabase is not configured in production for admin timeline list.",
    );
  }

  let countQuery = supabase.from("timeline_events").select("*", { count: "exact", head: true });
  let dataQuery = supabase
    .from("timeline_events")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (query) {
    countQuery = countQuery.ilike("title", `%${query}%`);
    dataQuery = dataQuery.ilike("title", `%${query}%`);
  }

  const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery]);

  if (error || !data) {
    console.error("Failed to fetch admin timeline list:", error);
    return fallbackOrThrow(
      () => {
        const fallback = buildFallbackTimelineResult(from, to, query);
        return {
          ...fallback,
          warning: isMissingSupabaseRelationError(error)
            ? formatSupabaseRelationWarning("timeline_events", "타임라인")
            : "타임라인 데이터를 불러오지 못해 임시 데이터를 표시하고 있습니다.",
        };
      },
      "Failed to fetch admin timeline list from Supabase.",
    );
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
    return fallbackOrThrow(
      () => null,
      `Supabase is not configured in production for timeline id: ${id}`,
    );
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch timeline by id (${id}):`, error);
    return fallbackOrThrow(
      () => null,
      `Failed to fetch timeline by id from Supabase: ${id}`,
    );
  }
  if (!data) return null;
  return rowToTimelineEvent(data);
}
