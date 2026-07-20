import { validateEditableHref } from "@/lib/validation/editable-link";
import { randomId } from "@/lib/custom-sections/id";

export const GLOBAL_LINK_SETS = {
  nav: "builder.global.navLinks",
  footer: "builder.global.footerLinks",
} as const;

export interface BuilderLinkItem {
  id: string;
  label: string;
  href: string;
}

export function createEmptyBuilderLink(): BuilderLinkItem {
  return {
    id: randomId("link"),
    label: "",
    href: "/",
  };
}

export function defaultNavLinks(): BuilderLinkItem[] {
  return [
    { id: "nav-story", label: "이야기", href: "/story" },
    { id: "nav-timeline", label: "타임라인", href: "/timeline" },
    { id: "nav-news", label: "소식", href: "/news" },
    { id: "nav-concert", label: "8·1 공연", href: "/concert" },
    { id: "nav-gallery", label: "갤러리", href: "/gallery" },
    { id: "nav-press", label: "자료실", href: "/press" },
    { id: "nav-share", label: "카드뉴스", href: "/share" },
    { id: "nav-board", label: "게시판", href: "/board" },
  ];
}

export function defaultFooterLinks(): BuilderLinkItem[] {
  return [
    { id: "footer-story", label: "이야기", href: "/story" },
    { id: "footer-timeline", label: "타임라인", href: "/timeline" },
    { id: "footer-news", label: "소식", href: "/news" },
    { id: "footer-concert", label: "8·1 공연", href: "/concert" },
    { id: "footer-gallery", label: "갤러리", href: "/gallery" },
    { id: "footer-press", label: "자료실", href: "/press" },
    { id: "footer-share", label: "카드뉴스", href: "/share" },
    { id: "footer-board", label: "게시판", href: "/board" },
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
