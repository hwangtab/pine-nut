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
    <div className="hidden xl:flex items-center gap-1">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        // 기간 한정 이벤트(공연) 링크는 warm 색으로 강조
        const isEvent = link.href === "/concert";

        return (
          <span key={link.id}>
            <NavigationLink
              href={link.href}
              className={`px-4 py-2 rounded-lg text-[15px] min-h-[44px] flex items-center transition-colors duration-300 ${
                isEvent ? "font-bold" : "font-medium"
              } ${
                isTransparent
                  ? active
                    ? "text-white bg-white/20"
                    : isEvent
                      ? "text-[#FFB3C1] hover:text-white hover:bg-white/10"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  : active
                    ? isEvent
                      ? "text-[var(--color-warm)] bg-[var(--color-warm)]/10"
                      : "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                    : isEvent
                      ? "text-[var(--color-warm)] hover:bg-[var(--color-warm)]/10"
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
        className="px-5 py-2 rounded-full text-[15px] font-bold text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[44px] flex items-center transition-colors"
        containerClassName="ml-3"
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
