"use client";

import { NewsListPage } from "@/components/news-list/NewsListPage";
import { koreanNewsListConfig } from "@/components/news-list/news-list-config";
import type { NewsItem } from "@/data/news";

export default function NewsListClient({
  newsItems,
}: {
  newsItems: NewsItem[];
}) {
  return (
    <NewsListPage
      newsItems={newsItems}
      newsListConfig={koreanNewsListConfig}
    />
  );
}
