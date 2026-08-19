export interface NewsDisplayItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  sourceName?: string;
  thumbnailUrl?: string;
}

export interface NewsListConfig {
  page: string;
  detailPathPrefix: string;
  allCategory: string;
  categories: readonly string[];
  dateLocale: string;
  hero: {
    imageUrl: string;
    imageContentKey: string;
    imageSection: string;
    titleKey: string;
    titleDefault: string;
    subtitleKey: string;
    subtitleDefault: string;
    eyebrowKey: string;
    eyebrowDefault: string;
  };
  intro: {
    contentKey: string;
    defaultValue: string;
  };
  empty: {
    contentKey: string;
    defaultValue: string;
  };
}

const heroImageUrl =
  "https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003499236_std.jpg";

export const koreanNewsListConfig: NewsListConfig = {
  page: "news",
  detailPathPrefix: "/news",
  allCategory: "전체",
  categories: ["공지", "집회", "언론보도", "연대"],
  dateLocale: "ko-KR",
  hero: {
    imageUrl: heroImageUrl,
    imageContentKey: "news.hero.image",
    imageSection: "hero",
    titleKey: "news.hero.title",
    titleDefault: "소식",
    subtitleKey: "news.hero.subtitle",
    subtitleDefault: "풍천리의 최신 소식을 전합니다",
    eyebrowKey: "news.hero.eyebrow",
    eyebrowDefault: "최신 소식",
  },
  intro: {
    contentKey: "news.intro.text",
    defaultValue: "풍천리의 이야기는 계속되고 있습니다. 언론이 주목하는 7년의 기록.",
  },
  empty: {
    contentKey: "news.empty.text",
    defaultValue: "해당 카테고리의 소식이 없습니다.",
  },
};

export const englishNewsListConfig: NewsListConfig = {
  page: "en/news",
  detailPathPrefix: "/en/news",
  allCategory: "All",
  categories: ["Notice", "Protest", "Press Coverage", "Solidarity"],
  dateLocale: "en-US",
  hero: {
    imageUrl: heroImageUrl,
    imageContentKey: "en.news.hero.image",
    imageSection: "hero",
    titleKey: "en.news.hero.title",
    titleDefault: "News",
    subtitleKey: "en.news.hero.subtitle",
    subtitleDefault: "Updates and coverage from the ongoing struggle in Pungcheon-ri",
    eyebrowKey: "en.news.hero.eyebrow",
    eyebrowDefault: "Latest Updates",
  },
  intro: {
    contentKey: "en.news.intro.text",
    defaultValue:
      "The story of Pungcheon-ri is still unfolding. These are the reports, statements, and field updates shaping the record.",
  },
  empty: {
    contentKey: "en.news.empty.text",
    defaultValue: "No updates are available in this category.",
  },
};
