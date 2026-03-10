"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "이야기", href: "/story" },
  { label: "타임라인", href: "/timeline" },
  { label: "소식", href: "/news" },
  { label: "갤러리", href: "/gallery" },
  { label: "자료실", href: "/press" },
  { label: "카드뉴스", href: "/share" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const isHeroPage = true;
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
            풍천리를 지켜주세요
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-[15px] font-medium min-h-[44px] flex items-center transition-colors duration-300 ${
                  isTransparent
                    ? isActive(link.href)
                      ? "text-white bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    : isActive(link.href)
                      ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-gray-100"
                }`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/petition"
              className="ml-3 px-5 py-2 rounded-lg text-[15px] font-bold text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[44px] flex items-center transition-colors"
            >
              함께하기
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors duration-300 ${
              isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          className="fixed inset-0 z-40 bg-white flex flex-col pt-16"
          role="dialog"
          aria-modal="true"
          aria-label="모바일 메뉴"
        >
          <nav className="flex flex-col px-6 py-8 gap-2" aria-label="모바일 내비게이션">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-4 rounded-xl text-xl font-medium min-h-[44px] flex items-center transition-colors ${
                  isActive(link.href)
                    ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-gray-50"
                }`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/petition"
              className="mt-4 px-4 py-4 rounded-xl text-xl font-bold text-white bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] min-h-[44px] flex items-center justify-center transition-colors"
            >
              함께하기
            </Link>
          </nav>
        </div>
      )}

    </>
  );
}
