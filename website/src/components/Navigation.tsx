"use client";

import { usePathname } from "next/navigation";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import MobileNavigationButton from "@/components/navigation/MobileNavigationButton";
import MobileNavigationMenu from "@/components/navigation/MobileNavigationMenu";
import NavigationAuthLinks from "@/components/navigation/NavigationAuthLinks";
import NavigationLogo from "@/components/navigation/NavigationLogo";
import useNavigationChrome from "@/components/navigation/useNavigationChrome";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { defaultNavLinks, parseBuilderLinks } from "@/lib/custom-sections";

export default function Navigation() {
  const { getContent, isActiveAdmin, isLoggedIn } = useAdminEdit();
  const pathname = usePathname();
  const navLinks = parseBuilderLinks(
    getContent("builder.global.navLinks"),
    defaultNavLinks(),
  );
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

  // 사진 위(투명)에서는 보는 유리 + 흰 잉크, 콘텐츠 위에서는 읽는 유리 + 어두운 잉크
  const material = isTransparent ? "glass" : "frost";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-2 sm:top-3 z-50 flex justify-center px-3 sm:px-4 pointer-events-none transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-[160%]"
        }`}
      >
        <nav
          aria-label="주요 내비게이션"
          className={`${material} pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300 ${
            isTransparent ? "px-4 sm:px-5 py-2.5" : "px-3 sm:px-4 py-2"
          }`}
        >
          <div className="relative z-[1] flex w-full items-center justify-between">
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
