"use client";

import { EditableLink, EditableText } from "@/components/editable";
import NavigationDropdown from "@/components/navigation/NavigationDropdown";
import NavigationLink from "@/components/navigation/NavigationLink";
import type { BuilderLinkItem } from "@/lib/custom-sections";
import { NAV_COPY, type ChromeLocale } from "@/lib/i18n/chrome";

interface DesktopNavigationProps {
  navLinks: BuilderLinkItem[];
  isTransparent: boolean;
  isActive: (href: string) => boolean;
  locale?: ChromeLocale;
  /** 링크 세트에 후원 링크가 이미 있으면 false — 같은 링크가 두 번 서지 않게 */
  showDonate?: boolean;
}

// 간격(ml-*)은 className에 둔다. EditableLink는 편집 모드가 아닐 때
// containerClassName을 그리지 않아, 거기 둔 여백은 방문자 화면에서 사라진다.
const CTA_CLASS =
  "ml-2 shrink-0 px-4 py-2 rounded-full text-[15px] font-bold whitespace-nowrap text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[44px] flex items-center transition-colors";

export default function DesktopNavigation({
  navLinks,
  isTransparent,
  isActive,
  locale = "ko",
  showDonate = true,
}: DesktopNavigationProps) {
  const copy = NAV_COPY[locale];
  const donateActive = isActive(copy.donateHref);
  // 후원은 서명 다음가는 행동이라 일반 링크보다 진하게, 솔리드 CTA보다는 약하게 둔다.
  const donateClassName = `ml-1 shrink-0 px-3 py-2 rounded-lg text-[15px] font-bold whitespace-nowrap min-h-[44px] flex items-center transition-colors duration-300 ${
    isTransparent
      ? donateActive
        ? "text-white bg-white/20"
        : "text-white hover:bg-white/10"
      : donateActive
        ? "text-[var(--color-warm)] bg-[var(--color-warm)]/10"
        : "text-[var(--color-warm)] hover:bg-[var(--color-warm)]/10"
  }`;

  return (
    <div className="hidden nav:flex items-center gap-0.5 min-w-0">
      {navLinks.map((link) => {
        const children = link.children ?? [];
        if (children.length > 0) {
          return (
            <NavigationDropdown
              key={link.id}
              link={link}
              items={children}
              isTransparent={isTransparent}
              isActive={isActive}
            />
          );
        }

        const active = isActive(link.href);

        return (
          <span key={link.id}>
            <NavigationLink
              href={link.href}
              className={`px-3 py-2 rounded-lg text-[15px] font-medium whitespace-nowrap min-h-[44px] flex items-center transition-colors duration-300 ${
                isTransparent
                  ? active
                    ? "text-white bg-white/20"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                  : active
                    ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              }`}
              label={link.label}
              ariaCurrent={active ? "page" : undefined}
            />
          </span>
        );
      })}
      {showDonate &&
        (locale === "en" ? (
          <NavigationLink
            href={copy.donateHref}
            className={donateClassName}
            label={copy.donate}
            ariaCurrent={donateActive ? "page" : undefined}
          />
        ) : (
          <EditableLink
            contentKey="nav.donate.href"
            defaultHref={copy.donateHref}
            page="nav"
            section="header"
            className={donateClassName}
            containerClassName="shrink-0"
          >
            <EditableText
              contentKey="nav.donate"
              defaultValue={copy.donate}
              as="span"
              page="nav"
              section="header"
            />
          </EditableLink>
        ))}
      {/* 영문 구간은 편집 키를 공유하지 않는다(lib/i18n/chrome.ts) */}
      {locale === "en" ? (
        <NavigationLink href={copy.ctaHref} className={CTA_CLASS} label={copy.cta} />
      ) : (
        <EditableLink
          contentKey="nav.cta.href"
          defaultHref={copy.ctaHref}
          page="nav"
          section="header"
          className={CTA_CLASS}
          containerClassName="shrink-0"
        >
          <EditableText
            contentKey="nav.cta"
            defaultValue={copy.cta}
            as="span"
            page="nav"
            section="header"
          />
        </EditableLink>
      )}
    </div>
  );
}
