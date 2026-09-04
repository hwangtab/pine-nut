import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { getPublishedNewsSummaries } from "@/lib/data/news";

// 정적 라우트. 영문 하위 페이지가 빠져 있어 색인 대상에서 통째로 누락됐었다.
const STATIC_PAGES = [
  { url: "/", priority: 1.0 },
  { url: "/story", priority: 0.9 },
  { url: "/timeline", priority: 0.8 },
  { url: "/concert", priority: 0.8 },
  { url: "/concert/village-feast", priority: 0.8 },
  { url: "/concert/before-cut", priority: 0.7 },
  { url: "/petition", priority: 0.9 },
  { url: "/donate", priority: 0.8 },
  { url: "/news", priority: 0.8 },
  { url: "/gallery", priority: 0.6 },
  { url: "/press", priority: 0.7 },
  { url: "/press/release", priority: 0.5 },
  { url: "/press/factsheet", priority: 0.5 },
  { url: "/share", priority: 0.7 },
  { url: "/board", priority: 0.5 },
  { url: "/privacy", priority: 0.3 },
  { url: "/en", priority: 0.5 },
  { url: "/en/story", priority: 0.5 },
  { url: "/en/timeline", priority: 0.4 },
  { url: "/en/petition", priority: 0.5 },
  { url: "/en/donate", priority: 0.4 },
  { url: "/en/news", priority: 0.4 },
  { url: "/en/gallery", priority: 0.3 },
  { url: "/en/press", priority: 0.4 },
  { url: "/en/press/release", priority: 0.3 },
  { url: "/en/press/factsheet", priority: 0.3 },
  { url: "/en/share", priority: 0.3 },
  { url: "/en/privacy", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: now,
    changeFrequency:
      page.url === "/news" || page.url === "/en/news"
        ? ("daily" as const)
        : ("weekly" as const),
    priority: page.priority,
  }));

  // 소식 상세는 실제 게시된 것만 담는다(삭제된 글의 URL이 남으면 404를 유발한다).
  // 조회가 실패해도 sitemap 자체는 정적 목록으로 응답해야 하므로 삼킨다.
  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const news = await getPublishedNewsSummaries();
    newsEntries = news.map((item) => ({
      url: `${SITE_URL}/news/${encodeURIComponent(item.slug)}`,
      lastModified: item.date ? new Date(item.date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("sitemap: failed to load published news", e);
  }

  return [...staticEntries, ...newsEntries];
}
