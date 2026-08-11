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

/**
 * 영문 구간(/en/*) 전용 링크. 한국어 링크를 그대로 쓰면 영문 사용자가 첫 클릭에
 * 한국어 사이트로 빠져나가고, /en 하위 페이지로 갈 경로가 아예 없다.
 * 영문판이 없는 페이지(공연·게시판)는 제외한다.
 */
export function defaultEnNavLinks(): BuilderLinkItem[] {
  return [
    { id: "en-nav-story", label: "Story", href: "/en/story" },
    { id: "en-nav-timeline", label: "Timeline", href: "/en/timeline" },
    { id: "en-nav-news", label: "News", href: "/en/news" },
    { id: "en-nav-gallery", label: "Gallery", href: "/en/gallery" },
    { id: "en-nav-press", label: "Press", href: "/en/press" },
    { id: "en-nav-share", label: "Share", href: "/en/share" },
    { id: "en-nav-ko", label: "한국어", href: "/" },
  ];
}

export function defaultEnFooterLinks(): BuilderLinkItem[] {
  return [
    { id: "en-footer-story", label: "Story", href: "/en/story" },
    { id: "en-footer-timeline", label: "Timeline", href: "/en/timeline" },
    { id: "en-footer-news", label: "News", href: "/en/news" },
    { id: "en-footer-gallery", label: "Gallery", href: "/en/gallery" },
    { id: "en-footer-press", label: "Press", href: "/en/press" },
    { id: "en-footer-petition", label: "Sign the petition", href: "/en/petition" },
    { id: "en-footer-privacy", label: "Privacy", href: "/en/privacy" },
    { id: "en-footer-ko", label: "한국어", href: "/" },
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
