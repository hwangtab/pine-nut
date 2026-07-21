"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hasTransparentNavHero } from "@/lib/nav-routes";

export default function useNavigationChrome(pathname: string) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const isTransparent = hasTransparentNavHero(pathname) && scrollY < 80 && !mobileMenuOpen;

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

  const isActive = useCallback(
    (href: string): boolean => pathname === href || pathname.startsWith(href + "/"),
    [pathname],
  );

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    requestAnimationFrame(() => {
      mobileMenuButtonRef.current?.focus();
    });
  }, []);

  const dismissMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const menuElement = mobileMenuRef.current;
    if (!menuElement) return;

    // 시트 내부 요소 + 헤더의 열기/닫기(X) 버튼을 함께 트랩에 포함해
    // 키보드 사용자가 우상단 닫기 버튼에도 도달할 수 있게 한다.
    const getFocusableElements = () => {
      const inSheet = Array.from(
        menuElement.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      );
      const toggle = mobileMenuButtonRef.current;
      return toggle ? [toggle, ...inSheet] : inSheet;
    };

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
      const activeIndex = active ? currentFocusable.indexOf(active) : -1;

      // 포커스가 트랩 링(시트 + 토글 버튼) 밖으로 나가면 첫 요소로 되돌린다.
      if (activeIndex === -1) {
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

  return {
    visible,
    isTransparent,
    mobileMenuOpen,
    mobileMenuRef,
    mobileMenuButtonRef,
    isActive,
    openMobileMenu,
    closeMobileMenu,
    dismissMobileMenu,
  };
}
