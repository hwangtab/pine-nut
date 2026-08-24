"use client";

import NavigationLink from "@/components/navigation/NavigationLink";
import type { BuilderLinkItem } from "@/lib/custom-sections";

interface NavigationDropdownProps {
  link: BuilderLinkItem;
  /** 하위 메뉴 항목. prop 이름을 children으로 두면 React 예약 prop과 겹친다. */
  items: BuilderLinkItem[];
  isTransparent: boolean;
  isActive: (href: string) => boolean;
}

/**
 * 하위 메뉴를 가진 대메뉴. 열고 닫는 데 JS 상태를 쓰지 않는다 —
 * hover(마우스)와 focus-within(키보드) 둘 다 CSS로 처리하면 외부 클릭·언마운트·
 * 라우트 전환 때 열린 채 남는 상태 버그가 아예 생기지 않는다.
 *
 * 닫힌 상태는 `hidden`이 아니라 `opacity-0 + pointer-events-none`이다.
 * visibility:hidden/display:none 이면 하위 링크가 포커스를 못 받아
 * focus-within이 영원히 켜지지 않고, 키보드로는 하위 메뉴에 닿을 수 없게 된다.
 */
export default function NavigationDropdown({
  link,
  items,
  isTransparent,
  isActive,
}: NavigationDropdownProps) {
  // 대메뉴는 자기 자신이거나 하위 항목 중 하나가 현재 페이지면 활성.
  const active = isActive(link.href) || items.some((child) => isActive(child.href));

  return (
    <div className="group relative">
      <NavigationLink
        href={link.href}
        className={`px-3 py-2 rounded-lg text-[15px] font-medium whitespace-nowrap min-h-[44px] flex items-center gap-1 transition-colors duration-300 ${
          isTransparent
            ? active
              ? "text-white bg-white/20"
              : "text-white/80 hover:text-white hover:bg-white/10"
            : active
              ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        }`}
        label={link.label}
        ariaCurrent={isActive(link.href) ? "page" : undefined}
        suffix={
          <span
            aria-hidden
            className="text-[10px] leading-none transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
          >
            ▾
          </span>
        }
      />

      <div className="absolute left-0 top-full pt-2 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
        <ul className="paper-sheet min-w-[13rem] rounded-xl border border-[var(--color-border)] p-1.5 shadow-[0_8px_24px_rgb(34_48_31/0.14)]">
          {items.map((child) => {
            const childActive = isActive(child.href);
            return (
              <li key={child.id}>
                <NavigationLink
                  href={child.href}
                  className={`px-3 py-2.5 rounded-lg text-[15px] font-medium min-h-[44px] flex items-center whitespace-nowrap transition-colors ${
                    childActive
                      ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                  label={child.label}
                  ariaCurrent={childActive ? "page" : undefined}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
