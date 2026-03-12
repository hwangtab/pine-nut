"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { EditableLink, EditableText } from "@/components/editable";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { defaultNavLinks, parseBuilderLinks } from "@/lib/custom-sections";

export default function Navigation() {
  const { getContent } = useAdminEdit();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const navLinks = parseBuilderLinks(
    getContent("builder.global.navLinks"),
    defaultNavLinks(),
  );

  const heroPages = ['/', '/story', '/timeline', '/news', '/gallery', '/press', '/share', '/petition', '/donate', '/en'];
  const isHeroPage = heroPages.includes(pathname);
  const isTransparent = isHeroPage && scrollY < 80 && !mobileMenuOpen;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < 10) {
      setVisible(true);
    } else if (currentScrollY < lastScrollY) {
      setVisible(true);
    } else if (currentScrollY > lastScrollY) {
      setVisible(false);
    }

    setLastScrollY(currentScrollY);
    setScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    requestAnimationFrame(() => {
      mobileMenuButtonRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const menuElement = mobileMenuRef.current;
    if (!menuElement) return;

    const getFocusableElements = () =>
      Array.from(
        menuElement.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      );

    const focusable = getFocusableElements();
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const currentFocusable = getFocusableElements();
      if (currentFocusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !menuElement.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen, closeMobileMenu]);

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
          {/* Logo */}
          <Link
            href="/"
            className={`text-lg font-bold shrink-0 min-h-[44px] flex items-center transition-colors duration-300 ${
              isTransparent ? "text-white" : "text-[var(--color-forest)]"
            }`}
          >
            <EditableText contentKey="nav.logo" defaultValue="풍천리를 지켜주세요" as="span" page="nav" section="header" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-[15px] font-medium min-h-[44px] flex items-center transition-colors duration-300 ${
                  isTransparent
                    ? isActive(link.href)
                      ? "text-white bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    : isActive(link.href)
                      ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                }`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <EditableLink
              contentKey="nav.cta.href"
              defaultHref="/petition"
              page="nav"
              section="header"
              className="px-5 py-2 rounded-full text-[15px] font-bold text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[44px] flex items-center transition-colors"
              containerClassName="ml-3"
            >
              <EditableText contentKey="nav.cta" defaultValue="함께하기" as="span" page="nav" section="header" />
            </EditableLink>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors duration-300 ${
              isTransparent ? "hover:bg-white/10" : "hover:bg-[var(--color-bg)]"
            }`}
            onClick={() => {
              if (mobileMenuOpen) {
                closeMobileMenu();
                return;
              }
              setMobileMenuOpen(true);
            }}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[var(--color-text)]" />
            ) : (
              <Menu className={`w-6 h-6 transition-colors duration-300 ${isTransparent ? "text-white" : "text-[var(--color-text)]"}`} />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="fixed inset-0 z-40 bg-white flex flex-col pt-16"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <h2 id="mobile-menu-title" className="sr-only">모바일 메뉴</h2>
          <div className="px-6 pt-4">
            <button
              type="button"
              onClick={closeMobileMenu}
              className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            >
              메뉴 닫기
            </button>
          </div>
          <nav className="flex flex-col px-6 py-4 gap-2" aria-label="모바일 내비게이션">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => closeMobileMenu()}
                className={`px-4 py-4 rounded-xl text-xl font-medium min-h-[44px] flex items-center transition-colors ${
                  isActive(link.href)
                    ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                }`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <EditableLink
              contentKey="nav.cta.href"
              defaultHref="/petition"
              page="nav"
              section="header"
              className="px-4 py-4 rounded-full text-xl font-bold text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[44px] flex items-center justify-center transition-colors"
              containerClassName="mt-4"
            >
              <EditableText contentKey="nav.cta" defaultValue="함께하기" as="span" page="nav" section="header" />
            </EditableLink>
          </nav>
        </div>
      )}

    </>
  );
}
