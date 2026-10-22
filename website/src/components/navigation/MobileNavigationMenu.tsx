"use client";

import type { RefObject } from "react";
import { EditableLink, EditableText } from "@/components/editable";
import NavigationAuthLinks from "@/components/navigation/NavigationAuthLinks";
import NavigationLink from "@/components/navigation/NavigationLink";
import type { BuilderLinkItem } from "@/lib/custom-sections";
import { NAV_COPY, type ChromeLocale } from "@/lib/i18n/chrome";

interface MobileNavigationMenuProps {
  menuRef: RefObject<HTMLDivElement | null>;
  navLinks: BuilderLinkItem[];
  isActive: (href: string) => boolean;
  onClose: () => void;
  onDismiss: () => void;
  isActiveAdmin?: boolean;
  isLoggedIn?: boolean;
  locale?: ChromeLocale;
  /** 링크 세트에 후원 링크가 이미 있으면 false — 같은 링크가 두 번 서지 않게 */
  showDonate?: boolean;
}

const CTA_CLASS =
  "px-4 py-3 rounded-full text-lg font-bold text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[48px] flex items-center justify-center transition-colors";
const DONATE_CLASS =
  "px-4 py-3 rounded-full text-lg font-bold text-[var(--color-warm)] border border-[var(--color-warm)]/45 hover:bg-[var(--color-warm)]/10 min-h-[48px] flex items-center justify-center transition-colors";

export default function MobileNavigationMenu({
  menuRef,
  navLinks,
  isActive,
  onClose,
  onDismiss,
  isActiveAdmin = false,
  isLoggedIn = false,
  locale = "ko",
  showDonate = true,
}: MobileNavigationMenuProps) {
  const copy = NAV_COPY[locale];

  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      className="paper-sheet fixed inset-0 z-40 flex flex-col overflow-hidden pt-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      <h2 id="mobile-menu-title" className="sr-only">
        {copy.mobileMenuTitle}
      </h2>
      <div className="relative z-[1] px-6 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-black/5 transition-colors"
        >
          {copy.closeMenu}
        </button>
      </div>
      {/* 주 행동(서명·후원)은 스크롤 영역 밖 맨 위에 고정한다. 목록 끝에 두면
          작은 화면에서 첫 화면 아래로 밀려, 메뉴를 열어도 서명 버튼이 보이지 않았다. */}
      <div
        className={`relative z-[1] grid gap-2 px-6 pt-2 pb-3 border-b border-[var(--color-border)] ${
          showDonate ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {locale === "en" ? (
          <NavigationLink
            href={copy.ctaHref}
            className={CTA_CLASS}
            label={copy.cta}
            onClick={onDismiss}
          />
        ) : (
          <EditableLink
            contentKey="nav.cta.href"
            defaultHref={copy.ctaHref}
            page="nav"
            section="header"
            className={CTA_CLASS}
            onNavigate={onDismiss}
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
        {showDonate &&
          (locale === "en" ? (
            <NavigationLink
              href={copy.donateHref}
              className={DONATE_CLASS}
              label={copy.donate}
              onClick={onDismiss}
            />
          ) : (
            <EditableLink
              contentKey="nav.donate.href"
              defaultHref={copy.donateHref}
              page="nav"
              section="header"
              className={DONATE_CLASS}
              onNavigate={onDismiss}
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
      </div>
      <nav
        className="relative z-[1] flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-3 pb-8"
        aria-label={copy.mobileNavLabel}
      >
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const children = link.children ?? [];

          return (
            <span key={link.id}>
              <NavigationLink
                href={link.href}
                className={`px-4 py-3 rounded-xl text-lg font-medium min-h-[48px] flex items-center transition-colors ${
                  active
                    ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                }`}
                label={link.label}
                onClick={onDismiss}
                ariaCurrent={active ? "page" : undefined}
              />

              {/* 하위 메뉴는 접지 않고 그대로 펼친다. 좁은 화면에서 탭 한 번을
                  더 요구하는 아코디언보다, 세로로 이어지는 목록이 빠르다. */}
              {children.length > 0 && (
                <ul className="ml-4 border-l border-[var(--color-border)] pl-3">
                  {children.map((child) => {
                    const childActive = isActive(child.href);
                    return (
                      <li key={child.id}>
                        <NavigationLink
                          href={child.href}
                          className={`px-4 py-2.5 rounded-xl text-base font-medium min-h-[44px] flex items-center transition-colors ${
                            childActive
                              ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                          }`}
                          label={child.label}
                          onClick={onDismiss}
                          ariaCurrent={childActive ? "page" : undefined}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </span>
          );
        })}
        <NavigationAuthLinks
          isActiveAdmin={isActiveAdmin}
          isLoggedIn={isLoggedIn}
          variant="mobile"
          locale={locale}
        />
      </nav>
    </div>
  );
}
