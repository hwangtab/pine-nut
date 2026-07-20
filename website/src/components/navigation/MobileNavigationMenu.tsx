"use client";

import type { RefObject } from "react";
import { EditableLink, EditableText } from "@/components/editable";
import NavigationAuthLinks from "@/components/navigation/NavigationAuthLinks";
import NavigationLink from "@/components/navigation/NavigationLink";
import type { BuilderLinkItem } from "@/lib/custom-sections";

interface MobileNavigationMenuProps {
  menuRef: RefObject<HTMLDivElement | null>;
  navLinks: BuilderLinkItem[];
  isActive: (href: string) => boolean;
  onClose: () => void;
  onDismiss: () => void;
  isActiveAdmin?: boolean;
  isLoggedIn?: boolean;
}

export default function MobileNavigationMenu({
  menuRef,
  navLinks,
  isActive,
  onClose,
  onDismiss,
  isActiveAdmin = false,
  isLoggedIn = false,
}: MobileNavigationMenuProps) {
  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      className="frost-sheet fixed inset-0 z-40 flex flex-col overflow-hidden pt-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      <h2 id="mobile-menu-title" className="sr-only">
        모바일 메뉴
      </h2>
      <div className="relative z-[1] px-6 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold text-[var(--frost-muted)] hover:text-[var(--color-text)] hover:bg-black/5 transition-colors"
        >
          메뉴 닫기
        </button>
      </div>
      <nav
        className="relative z-[1] flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-3 pb-8"
        aria-label="모바일 내비게이션"
      >
        {navLinks.map((link) => {
          const active = isActive(link.href);
          // 기간 한정 이벤트(공연) 링크는 warm 색으로 강조
          const isEvent = link.href === "/concert";

          return (
            <span key={link.id}>
              <NavigationLink
                href={link.href}
                className={`px-4 py-3 rounded-xl text-lg min-h-[48px] flex items-center transition-colors ${
                  isEvent ? "font-bold" : "font-medium"
                } ${
                  active
                    ? isEvent
                      ? "text-[var(--color-warm)] bg-[var(--color-warm)]/10"
                      : "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                    : isEvent
                      ? "text-[var(--color-warm)] hover:bg-[var(--color-warm)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                }`}
                label={link.label}
                onClick={onDismiss}
                ariaCurrent={active ? "page" : undefined}
              />
            </span>
          );
        })}
        <EditableLink
          contentKey="nav.cta.href"
          defaultHref="/petition"
          page="nav"
          section="header"
          className="px-4 py-3 rounded-full text-lg font-bold text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[48px] flex items-center justify-center transition-colors"
          containerClassName="mt-3"
          onNavigate={onDismiss}
        >
          <EditableText
            contentKey="nav.cta"
            defaultValue="함께하기"
            as="span"
            page="nav"
            section="header"
          />
        </EditableLink>
        <NavigationAuthLinks
          isActiveAdmin={isActiveAdmin}
          isLoggedIn={isLoggedIn}
          variant="mobile"
        />
      </nav>
    </div>
  );
}
