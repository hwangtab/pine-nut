import { validateOptionalImageUrl } from "@/lib/validation/url";
import { validateEditableHref } from "@/lib/validation/editable-link";

export const BUILDER_PAGES = [
  { id: "home", label: "홈" },
  { id: "story", label: "이야기" },
  { id: "timeline", label: "타임라인" },
  { id: "news", label: "소식" },
  { id: "press", label: "자료실" },
  { id: "petition", label: "서명" },
  { id: "donate", label: "후원" },
  { id: "share", label: "카드뉴스" },
  { id: "gallery", label: "갤러리" },
  { id: "privacy", label: "개인정보처리방침" },
  { id: "en", label: "영문 페이지" },
] as const;

export type BuilderPageId = (typeof BUILDER_PAGES)[number]["id"];

export const EXISTING_PAGE_SECTIONS: Partial<
  Record<BuilderPageId, { id: string; label: string }[]>
> = {
  home: [
    { id: "hero", label: "히어로" },
    { id: "about", label: "마을 소개" },
    { id: "impact", label: "위협" },
    { id: "hope", label: "희망" },
    { id: "quotes", label: "주민 목소리" },
    { id: "cta", label: "행동 요청" },
    { id: "stats", label: "숫자 요약" },
  ],
  story: [
    { id: "hero", label: "히어로" },
    { id: "village", label: "마을 소개" },
    { id: "plant", label: "양수발전소" },
    { id: "reasons", label: "반대 이유" },
    { id: "battle", label: "투쟁 기록" },
    { id: "demands", label: "주민 요구" },
    { id: "video", label: "영상" },
    { id: "location", label: "위치" },
    { id: "cta", label: "행동 요청" },
  ],
  press: [
    { id: "kit", label: "보도 키트" },
    { id: "facts", label: "팩트시트" },
    { id: "contact", label: "연락처" },
    { id: "cite", label: "인용 안내" },
  ],
  gallery: [
    { id: "beauty", label: "아름다움" },
    { id: "struggle", label: "투쟁" },
    { id: "solidarity", label: "연대" },
    { id: "cta", label: "제보 CTA" },
  ],
  en: [
    { id: "story", label: "Story" },
    { id: "numbers", label: "Numbers" },
    { id: "stake", label: "What's at Stake" },
    { id: "help", label: "How You Can Help" },
  ],
};

export const SECTION_THEME_OPTIONS = [
  { id: "default", label: "기본" },
  { id: "paper", label: "화이트" },
  { id: "warm", label: "웜" },
  { id: "mist", label: "미스트" },
] as const;

export const SECTION_SPACING_OPTIONS = [
  { id: "compact", label: "좁게" },
  { id: "normal", label: "보통" },
  { id: "relaxed", label: "넓게" },
] as const;

export type ExistingSectionTheme = (typeof SECTION_THEME_OPTIONS)[number]["id"];
export type ExistingSectionSpacing = (typeof SECTION_SPACING_OPTIONS)[number]["id"];

export interface ExistingSectionStyle {
  id: string;
  theme: ExistingSectionTheme;
  spacing: ExistingSectionSpacing;
}

export const GLOBAL_LINK_SETS = {
  nav: "builder.global.navLinks",
  footer: "builder.global.footerLinks",
} as const;

export interface BuilderLinkItem {
  id: string;
  label: string;
  href: string;
}

export interface CustomSectionButton {
  label: string;
  href: string;
}

export interface CustomSection {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  theme: "forest" | "sand" | "paper";
  align: "left" | "center";
  primaryButton: CustomSectionButton;
  secondaryButton: CustomSectionButton;
  visible: boolean;
}

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function createEmptyBuilderLink(): BuilderLinkItem {
  return {
    id: randomId("link"),
    label: "",
    href: "/",
  };
}

export function createEmptyCustomSection(): CustomSection {
  return {
    id: randomId("section"),
    eyebrow: "새 섹션",
    title: "제목을 입력하세요",
    body: "설명을 입력하세요",
    imageUrl: "",
    imageAlt: "",
    theme: "paper",
    align: "left",
    primaryButton: {
      label: "",
      href: "/",
    },
    secondaryButton: {
      label: "",
      href: "/",
    },
    visible: true,
  };
}

export function defaultNavLinks(): BuilderLinkItem[] {
  return [
    { id: "nav-story", label: "이야기", href: "/story" },
    { id: "nav-timeline", label: "타임라인", href: "/timeline" },
    { id: "nav-news", label: "소식", href: "/news" },
    { id: "nav-gallery", label: "갤러리", href: "/gallery" },
    { id: "nav-press", label: "자료실", href: "/press" },
    { id: "nav-share", label: "카드뉴스", href: "/share" },
  ];
}

export function defaultFooterLinks(): BuilderLinkItem[] {
  return [
    { id: "footer-story", label: "이야기", href: "/story" },
    { id: "footer-timeline", label: "타임라인", href: "/timeline" },
    { id: "footer-news", label: "소식", href: "/news" },
    { id: "footer-gallery", label: "갤러리", href: "/gallery" },
    { id: "footer-press", label: "자료실", href: "/press" },
    { id: "footer-share", label: "카드뉴스", href: "/share" },
    { id: "footer-petition", label: "서명하기", href: "/petition" },
    { id: "footer-donate", label: "후원하기", href: "/donate" },
  ];
}

export function parseBuilderLinks(
  rawValue: string | undefined,
  fallback: BuilderLinkItem[],
): BuilderLinkItem[] {
  if (!rawValue) return fallback;

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return fallback;

    return parsed
      .filter((item): item is Partial<BuilderLinkItem> => !!item && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" && item.id ? item.id : randomId("link"),
        label: typeof item.label === "string" ? item.label : "",
        href: typeof item.href === "string" && item.href ? item.href : "/",
      }));
  } catch {
    return fallback;
  }
}

export function validateBuilderLinks(items: BuilderLinkItem[]): string | null {
  for (const item of items) {
    if (!item.label.trim()) {
      return "링크 이름을 입력해주세요.";
    }

    const hrefValidation = validateEditableHref(item.href, "링크 주소");
    if (hrefValidation.error) {
      return hrefValidation.error;
    }
  }

  return null;
}

export function parseCustomSections(rawValue: string | undefined): CustomSection[] {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Partial<CustomSection> => !!item && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" && item.id ? item.id : randomId("section"),
        eyebrow: typeof item.eyebrow === "string" ? item.eyebrow : "",
        title: typeof item.title === "string" ? item.title : "",
        body: typeof item.body === "string" ? item.body : "",
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "",
        imageAlt: typeof item.imageAlt === "string" ? item.imageAlt : "",
        theme:
          item.theme === "forest" || item.theme === "sand" || item.theme === "paper"
            ? item.theme
            : "paper",
        align: item.align === "center" ? "center" : "left",
        primaryButton: {
          label:
            item.primaryButton && typeof item.primaryButton === "object" && typeof item.primaryButton.label === "string"
              ? item.primaryButton.label
              : "",
          href:
            item.primaryButton && typeof item.primaryButton === "object" && typeof item.primaryButton.href === "string"
              ? item.primaryButton.href
              : "/",
        },
        secondaryButton: {
          label:
            item.secondaryButton && typeof item.secondaryButton === "object" && typeof item.secondaryButton.label === "string"
              ? item.secondaryButton.label
              : "",
          href:
            item.secondaryButton && typeof item.secondaryButton === "object" && typeof item.secondaryButton.href === "string"
              ? item.secondaryButton.href
              : "/",
        },
        visible: item.visible !== false,
      }));
  } catch {
    return [];
  }
}

export function validateCustomSections(sections: CustomSection[]): string | null {
  for (const section of sections) {
    if (!section.title.trim()) {
      return "커스텀 섹션 제목을 입력해주세요.";
    }

    if (section.imageUrl.trim()) {
      const imageValidation = validateOptionalImageUrl(section.imageUrl, "섹션 이미지");
      if (imageValidation.error) {
        return imageValidation.error;
      }
    }

    if (section.primaryButton.label.trim()) {
      const hrefValidation = validateEditableHref(
        section.primaryButton.href,
        "기본 버튼 링크",
      );
      if (hrefValidation.error) {
        return hrefValidation.error;
      }
    }

    if (section.secondaryButton.label.trim()) {
      const hrefValidation = validateEditableHref(
        section.secondaryButton.href,
        "보조 버튼 링크",
      );
      if (hrefValidation.error) {
        return hrefValidation.error;
      }
    }
  }

  return null;
}

export function parseExistingSectionOrder(
  rawValue: string | undefined,
  defaultOrder: string[],
): string[] {
  if (!rawValue) return defaultOrder;

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return defaultOrder;

    const parsedIds = parsed.filter((item): item is string => typeof item === "string");
    const nextOrder = parsedIds.filter((id) => defaultOrder.includes(id));
    const missing = defaultOrder.filter((id) => !nextOrder.includes(id));
    return [...nextOrder, ...missing];
  } catch {
    return defaultOrder;
  }
}

export function parseExistingSectionStyles(
  rawValue: string | undefined,
): Record<string, ExistingSectionStyle> {
  if (!rawValue) return {};

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return {};

    return Object.fromEntries(
      parsed
        .filter((item): item is Partial<ExistingSectionStyle> => !!item && typeof item === "object")
        .map((item) => [
          typeof item.id === "string" ? item.id : "",
          {
            id: typeof item.id === "string" ? item.id : "",
            theme:
              item.theme === "paper" || item.theme === "warm" || item.theme === "mist"
                ? item.theme
                : "default",
            spacing:
              item.spacing === "compact" || item.spacing === "relaxed"
                ? item.spacing
                : "normal",
          } satisfies ExistingSectionStyle,
        ])
        .filter(([id]) => !!id),
    );
  } catch {
    return {};
  }
}

export function serializeExistingSectionStyles(
  styles: Record<string, ExistingSectionStyle>,
  sectionIds: string[],
): ExistingSectionStyle[] {
  return sectionIds.map((id) => ({
    id,
    theme: styles[id]?.theme ?? "default",
    spacing: styles[id]?.spacing ?? "normal",
  }));
}
