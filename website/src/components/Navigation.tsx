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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${
          isTransparent
            ? "bg-transparent border-b border-transparent"
            : "bg-white/90 backdrop-blur-md border-b border-[var(--color-border)]"
        }`}
      >
        <nav
          className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16"
          aria-label="주요 내비게이션"
        >
          <NavigationLogo isTransparent={isTransparent} />
          <div className="hidden md:flex items-center">
            <DesktopNavigation
              navLinks={navLinks}
              isTransparent={isTransparent}
              isActive={isActive}
            />
            <NavigationAuthLinks
              isActiveAdmin={isActiveAdmin}
              isLoggedIn={isLoggedIn}
              variant="desktop"
            />
          </div>
          <MobileNavigationButton
            buttonRef={mobileMenuButtonRef}
            isOpen={mobileMenuOpen}
            isTransparent={isTransparent}
            onOpen={openMobileMenu}
            onClose={closeMobileMenu}
          />
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
