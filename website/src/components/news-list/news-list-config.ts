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

interface CategoryFilterStyle {
  color: string;
  activeColor: string;
}

export interface NewsListConfig {
  page: string;
  detailPathPrefix: string;
  allCategory: string;
  categories: readonly string[];
  dateLocale: string;
  categoryFilterStyles: Record<string, CategoryFilterStyle>;
  categoryTagColors: Record<string, string>;
  fallbackFilterStyle: CategoryFilterStyle;
  fallbackTagColor: string;
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

const koreanCategoryFilterStyles: NewsListConfig["categoryFilterStyles"] = {
  공지: {
    color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
    activeColor: "bg-[var(--color-sky)] text-white",
  },
  집회: {
    color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
    activeColor: "bg-[var(--color-warm)] text-white",
  },
  언론보도: {
    color: "bg-[var(--color-earth)]/10 text-[var(--color-earth)]",
    activeColor: "bg-[var(--color-earth)] text-white",
  },
  연대: {
    color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
    activeColor: "bg-[var(--color-forest)] text-white",
  },
};

const koreanCategoryTagColors: NewsListConfig["categoryTagColors"] = {
  공지: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
  집회: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
  언론보도: "bg-[var(--color-earth)]/10 text-[var(--color-earth)]",
  연대: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
};

const englishCategoryFilterStyles: NewsListConfig["categoryFilterStyles"] = {
  Notice: koreanCategoryFilterStyles.공지,
  Protest: koreanCategoryFilterStyles.집회,
  "Press Coverage": koreanCategoryFilterStyles.언론보도,
  Solidarity: koreanCategoryFilterStyles.연대,
};

const englishCategoryTagColors: NewsListConfig["categoryTagColors"] = {
  Notice: koreanCategoryTagColors.공지,
  Protest: koreanCategoryTagColors.집회,
  "Press Coverage": koreanCategoryTagColors.언론보도,
  Solidarity: koreanCategoryTagColors.연대,
};

const fallbackFilterStyle = {
  color: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
  activeColor: "bg-[var(--color-text)] text-white",
};
const heroImageUrl =
  "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg";

export const koreanNewsListConfig: NewsListConfig = {
  page: "news",
  detailPathPrefix: "/news",
  allCategory: "전체",
  categories: ["공지", "집회", "언론보도", "연대"],
  dateLocale: "ko-KR",
  categoryFilterStyles: koreanCategoryFilterStyles,
  categoryTagColors: koreanCategoryTagColors,
  fallbackFilterStyle,
  fallbackTagColor: koreanCategoryTagColors.공지,
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
  categoryFilterStyles: englishCategoryFilterStyles,
  categoryTagColors: englishCategoryTagColors,
  fallbackFilterStyle,
  fallbackTagColor: englishCategoryTagColors.Notice,
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
