"use client";

import { NewsListPage } from "@/components/news-list/NewsListPage";
import { englishNewsListConfig } from "@/components/news-list/news-list-config";
import type { EnglishNewsSummary } from "@/lib/i18n/news-en";

// 소식은 한국어로 발행된다. 번역표(lib/i18n/news-en.ts)에 없는 글은 한국어 제목·요약이
// 그대로 목록에 나오므로, 영어 독자가 깨진 화면으로 오인하지 않게 맨 위 안내문에서
// 먼저 밝힌다. 기계 번역은 하지 않는다.
const KOREAN_ONLY_NOTICE =
  "News articles are published in Korean. Articles without an English translation are shown in their original Korean.";

export default function EnglishNewsListClient({
  newsItems,
}: {
  newsItems: EnglishNewsSummary[];
}) {
  const hasKoreanOnly = newsItems.some((item) => !item.isTranslated);
  // 관리자가 소개 문구(en.news.intro.text)를 편집했다면 그 값이 우선하고, 이 안내는
  // 기본값에만 붙는다.
  const newsListConfig = hasKoreanOnly
    ? {
        ...englishNewsListConfig,
        intro: {
          ...englishNewsListConfig.intro,
          defaultValue: `${englishNewsListConfig.intro.defaultValue} ${KOREAN_ONLY_NOTICE}`,
        },
      }
    : englishNewsListConfig;

  return (
    <NewsListPage
      newsItems={newsItems}
      newsListConfig={newsListConfig}
    />
  );
}
