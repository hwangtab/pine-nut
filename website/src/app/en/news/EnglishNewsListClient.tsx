"use client";

import { NewsListPage } from "@/components/news-list/NewsListPage";
import { englishNewsListConfig } from "@/components/news-list/news-list-config";
import type { EnglishNewsSummary } from "@/lib/i18n/news-en";

export default function EnglishNewsListClient({
  newsItems,
}: {
  newsItems: EnglishNewsSummary[];
}) {
  return (
    <NewsListPage
      newsItems={newsItems}
      newsListConfig={englishNewsListConfig}
    />
  );
}
