import { getPublishedNews } from "@/lib/data/news";
import NewsListClient from "./NewsListClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const newsItems = await getPublishedNews();
  return <NewsListClient newsItems={newsItems} />;
}
