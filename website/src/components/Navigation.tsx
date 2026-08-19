"use client";

import { usePathname } from "next/navigation";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import MobileNavigationButton from "@/components/navigation/MobileNavigationButton";
import MobileNavigationMenu from "@/components/navigation/MobileNavigationMenu";
import NavigationAuthLinks from "@/components/navigation/NavigationAuthLinks";
import NavigationLogo from "@/components/navigation/NavigationLogo";
import useNavigationChrome from "@/components/navigation/useNavigationChrome";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { defaultEnNavLinks, defaultNavLinks, parseBuilderLinks } from "@/lib/custom-sections";

export default function Navigation() {
  const { getContent, isActiveAdmin, isLoggedIn } = useAdminEdit();
  const pathname = usePathname();
  // 영문 구간에서는 영문 링크 세트를 쓴다. 한국어 링크를 그대로 두면 영문 사용자가
  // 첫 클릭에 한국어 사이트로 이탈하고, /en 하위 페이지로 갈 경로가 없다.
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const navLinks = isEnglish
    ? defaultEnNavLinks()
    : parseBuilderLinks(getContent("builder.global.navLinks"), defaultNavLinks());
  const {
    visible,
    isTransparent,
    mobileMenuOpen,
    mobileMenuRef,
    mobileMenuButtonRef,
    isActive,
    openMobileMenu,
    closeMobileMenu,
    dismissMobileMenu,
  } = useNavigationChrome(pathname);

  // 사진 위(투명)에서는 투명 배경 + 흰 잉크, 콘텐츠 위(스크롤 후)에서는 불투명 한지 + 어두운 잉크
  const chrome = isTransparent
    ? "bg-transparent text-white"
    : "paper-sheet border-b border-[var(--color-border)] shadow-[0_2px_12px_rgb(34_48_31/0.06)]";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav
          aria-label="주요 내비게이션"
          className={`${chrome} px-4 sm:px-6 py-3 transition-colors duration-300`}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <NavigationLogo isTransparent={isTransparent} />
            <div className="hidden nav:flex items-center min-w-0">
              <DesktopNavigation
                navLinks={navLinks}
                isTransparent={isTransparent}
                isActive={isActive}
              />
              <NavigationAuthLinks
                isActiveAdmin={isActiveAdmin}
                isLoggedIn={isLoggedIn}
                variant="desktop"
                isTransparent={isTransparent}
              />
            </div>
            <MobileNavigationButton
              buttonRef={mobileMenuButtonRef}
              isOpen={mobileMenuOpen}
              isTransparent={isTransparent}
              onOpen={openMobileMenu}
              onClose={closeMobileMenu}
            />
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <MobileNavigationMenu
          menuRef={mobileMenuRef}
          navLinks={navLinks}
          isActive={isActive}
          onClose={closeMobileMenu}
          onDismiss={dismissMobileMenu}
          isActiveAdmin={isActiveAdmin}
          isLoggedIn={isLoggedIn}
        />
      )}
    </>
  );
}
