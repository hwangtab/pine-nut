"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const HERO_PAGES = [
  "/",
  "/story",
  "/timeline",
  "/news",
  "/gallery",
  "/press",
  "/share",
  "/petition",
  "/donate",
  "/en",
];

export default function useNavigationChrome(pathname: string) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const isTransparent = HERO_PAGES.includes(pathname) && scrollY < 80 && !mobileMenuOpen;

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

    const getFocusableElements = () =>
      Array.from(
        menuElement.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
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
