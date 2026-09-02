import { unstable_cache } from "next/cache";
import { createSupabaseAnonClient } from "@/lib/supabase-anon";

export interface PageContent {
  id: string;
  content_key: string;
  content_type: string;
  value: string;
  metadata: Record<string, string>;
  page: string;
  section: string | null;
  updated_at: string;
  updated_by: string;
}

/**
 * Fetch all content overrides for a given page (or all pages).
 * Returns a Map keyed by content_key for O(1) lookups.
 */
export const PAGE_CONTENT_CACHE_TAG = "page-content";

/** 캐시되지 않는 원본 조회. 쿠키를 읽지 않는 익명 클라이언트를 쓴다 —
 * 이 함수를 부르는 루트 레이아웃이 cookies()에 닿는 순간 사이트 전체가
 * 동적 렌더링으로 떨어지기 때문이다(supabase-anon.ts 주석 참고). */
async function fetchAllPageContent(): Promise<Record<string, PageContent>> {
  const supabase = createSupabaseAnonClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .order("content_key");

  if (error || !data) return {};

  const map: Record<string, PageContent> = {};
  for (const row of data) {
    map[row.content_key] = row as PageContent;
  }
  return map;
}

/**
 * CMS 오버라이드 전체. 루트 레이아웃이 모든 페이지에서 호출하므로, 캐시가
 * 없으면 방문 1회마다 page_content 전량 SELECT가 한 번씩 나간다.
 *
 * 만료를 기다리지 않아도 된다 — 관리자가 저장·복원할 때
 * revalidatePageContentPages()가 PAGE_CONTENT_CACHE_TAG를 무효화하므로 편집은
 * 즉시 반영된다. revalidate 값은 그 경로를 타지 않는 변경(DB 직접 수정 등)에
 * 대비한 안전판이다.
 */
const getCachedPageContent = unstable_cache(fetchAllPageContent, ["page-content-all"], {
  tags: [PAGE_CONTENT_CACHE_TAG],
  revalidate: 3600,
});

export async function getAllPageContent(): Promise<Record<string, PageContent>> {
  return getCachedPageContent();
}
