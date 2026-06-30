export type TimelineYearValue = "전체" | "All" | number;

export interface TimelineDisplayEvent {
  id: number;
  date: string;
  year: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface TimelineCategoryStyle {
  dot: string;
  pill: string;
  pillText: string;
}

export interface TimelineConfig {
  page: string;
  years: readonly TimelineYearValue[];
  allYear: TimelineYearValue;
  imageSourceLabel: string;
  formatYear: (year: TimelineYearValue) => string;
  categoryStyles: Record<string, TimelineCategoryStyle>;
  fallbackCategoryStyle: TimelineCategoryStyle;
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
  quote: {
    contentKey: string;
    defaultValue: string;
  };
  filterHint: {
    contentKey: string;
    defaultValue: string;
  };
  empty: {
    contentKey: string;
    defaultValue: string;
  };
  cta: {
    titleKey: string;
    titleDefault: string;
    hrefKey: string;
    defaultHref: string;
    buttonKey: string;
    buttonDefault: string;
  };
}

const koreanCategoryStyles: TimelineConfig["categoryStyles"] = {
  회의: {
    dot: "bg-[var(--color-forest)]",
    pill: "bg-[var(--color-forest)]/10",
    pillText: "text-[var(--color-forest)]",
  },
  집회: {
    dot: "bg-[var(--color-warm)]",
    pill: "bg-[var(--color-warm)]/10",
    pillText: "text-[var(--color-warm)]",
  },
  법률: { dot: "bg-red-500", pill: "bg-red-100", pillText: "text-red-800" },
  연대: {
    dot: "bg-[var(--color-sky)]",
    pill: "bg-[var(--color-sky)]/10",
    pillText: "text-[var(--color-sky)]",
  },
  기타: {
    dot: "bg-[var(--color-earth)]",
    pill: "bg-[var(--color-earth)]/10",
    pillText: "text-[var(--color-earth)]",
  },
};

const englishCategoryStyles: TimelineConfig["categoryStyles"] = {
  Meetings: koreanCategoryStyles.회의,
  Protest: koreanCategoryStyles.집회,
  Legal: koreanCategoryStyles.법률,
  Solidarity: koreanCategoryStyles.연대,
  Other: koreanCategoryStyles.기타,
};

const fallbackCategoryStyle = koreanCategoryStyles.기타;
const heroImageUrl =
  "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg";

export const koreanTimelineConfig: TimelineConfig = {
  page: "timeline",
  years: ["전체", 2019, 2021, 2022, 2023, 2024, 2025, 2026],
  allYear: "전체",
  imageSourceLabel: "사진 출처: 언론 보도",
  formatYear: (year) => (year === "전체" ? "전체" : `${year}년`),
  categoryStyles: koreanCategoryStyles,
  fallbackCategoryStyle,
  hero: {
    imageUrl: heroImageUrl,
    imageContentKey: "timeline.hero.image",
    imageSection: "hero",
    titleKey: "timeline.hero.title",
    titleDefault: "7년의 기록",
    subtitleKey: "timeline.hero.subtitle",
    subtitleDefault: "2019년부터 현재까지, 풍천리 주민들의 발자취",
    eyebrowKey: "timeline.hero.eyebrow",
    eyebrowDefault: "투쟁 연대기",
  },
  quote: {
    contentKey: "timeline.quote.text",
    defaultValue: "“2019년부터 오늘까지, 단 하루도 쉬지 않았습니다”",
  },
  filterHint: {
    contentKey: "timeline.filter.hint",
    defaultValue: "좌우로 스크롤해 연도를 확인하세요.",
  },
  empty: {
    contentKey: "timeline.empty.text",
    defaultValue: "해당 연도의 기록이 없습니다.",
  },
  cta: {
    titleKey: "timeline.cta.title",
    titleDefault: "이 투쟁에 함께해주세요",
    hrefKey: "timeline.cta.href",
    defaultHref: "/petition",
    buttonKey: "timeline.cta.button",
    buttonDefault: "서명에 참여하기",
  },
};

export const englishTimelineConfig: TimelineConfig = {
  page: "en/timeline",
  years: ["All", 2019, 2021, 2022, 2023, 2024, 2025, 2026],
  allYear: "All",
  imageSourceLabel: "Photo source: media report",
  formatYear: (year) => (year === "All" ? "All" : `${year}`),
  categoryStyles: englishCategoryStyles,
  fallbackCategoryStyle,
  hero: {
    imageUrl: heroImageUrl,
    imageContentKey: "en.timeline.hero.image",
    imageSection: "hero",
    titleKey: "en.timeline.hero.title",
    titleDefault: "Seven Years of Resistance",
    subtitleKey: "en.timeline.hero.subtitle",
    subtitleDefault:
      "A timeline of the Pungcheon-ri residents' struggle from 2019 to the present",
    eyebrowKey: "en.timeline.hero.eyebrow",
    eyebrowDefault: "Chronology",
  },
  quote: {
    contentKey: "en.timeline.quote.text",
    defaultValue: "“Not a single week has been skipped since 2019.”",
  },
  filterHint: {
    contentKey: "en.timeline.filter.hint",
    defaultValue: "Scroll sideways to browse the years.",
  },
  empty: {
    contentKey: "en.timeline.empty.text",
    defaultValue: "No events are available for this year.",
  },
  cta: {
    titleKey: "en.timeline.cta.title",
    titleDefault: "Stand with the residents",
    hrefKey: "en.timeline.cta.href",
    defaultHref: "/en/petition",
    buttonKey: "en.timeline.cta.button",
    buttonDefault: "Sign the petition",
  },
};
