"use client";

import { EditableLink, EditableText } from "@/components/editable";
import NavigationLink from "@/components/navigation/NavigationLink";
import type { BuilderLinkItem } from "@/lib/custom-sections";

interface DesktopNavigationProps {
  navLinks: BuilderLinkItem[];
  isTransparent: boolean;
  isActive: (href: string) => boolean;
}

export default function DesktopNavigation({
  navLinks,
  isTransparent,
  isActive,
}: DesktopNavigationProps) {
  return (
    <div className="hidden nav:flex items-center gap-0.5 min-w-0">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        // 기간 한정 이벤트(공연) 링크는 forest 색으로 강조 — warm은 "함께하기" CTA 전용
        // amber(warm)는 서명·후원·공유 등 사이트 전역 CTA 전용 색이라, 내비 안에
        // amber가 두 개 생기면 주요 액션의 시선 쏠림이 분산된다. 그래서 이벤트 링크는
        // 의도적으로 amber를 쓰지 않는다 — "복원"하지 말 것.
        const isEvent = link.href === "/concert";

        return (
          <span key={link.id}>
            <NavigationLink
              href={link.href}
              className={`px-3 py-2 rounded-lg text-[15px] whitespace-nowrap min-h-[44px] flex items-center transition-colors duration-300 ${
                isEvent ? "font-bold" : "font-medium"
              } ${
                isTransparent
                  ? active
                    ? "text-white bg-white/20"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                  : active
                    ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                    : isEvent
                      ? "text-[var(--color-forest)] hover:bg-[var(--color-forest)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              }`}
              label={link.label}
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
        className="px-4 py-2 rounded-full text-[15px] font-bold whitespace-nowrap text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[44px] flex items-center transition-colors"
        containerClassName="ml-2 shrink-0"
      >
        <EditableText
          contentKey="nav.cta"
          defaultValue="함께하기"
          as="span"
          page="nav"
          section="header"
        />
      </EditableLink>
    </div>
  );
}
