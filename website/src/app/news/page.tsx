import { getPublishedNewsSummaries } from "@/lib/data/news";
import NewsListClient from "./NewsListClient";

/**
 * 정적 프리렌더 + 태그 무효화로 서빙한다. 관리자가 소식을 저장·삭제하면
 * revalidateNewsPaths()가 이 경로를 즉시 무효화하므로(lib/actions/news/revalidation.ts)
 * 아래 시간값은 그 경로를 타지 않는 변경(DB 직접 수정 등)에 대비한 안전판이다.
 * 예전에는 force-dynamic이 걸려 있었는데, 이 페이지들은 방문자가 누구든 같은
 * 내용을 보여주면서도 조회 1회마다 서버 렌더 + Supabase 왕복을 냈다.
 */
export const revalidate = 3600;

export default async function NewsPage() {
  const newsItems = await getPublishedNewsSummaries();
  return <NewsListClient newsItems={newsItems} />;
}
