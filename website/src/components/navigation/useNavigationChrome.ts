"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hasTransparentNavHero } from "@/lib/nav-routes";

export default function useNavigationChrome(pathname: string) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  // 실제 좌표 대신 "히어로를 지났는가"만 state로 둔다. 같은 값이면 React가 렌더를
  // 건너뛰므로, 스크롤 이벤트마다 내비 전체가 다시 그려지지 않는다.
  const [pastHero, setPastHero] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const isTransparent = hasTransparentNavHero(pathname) && !pastHero && !mobileMenuOpen;

  // 직전 스크롤 위치는 화면에 그리지 않는 값이라 ref로 둔다. state로 두면 스크롤할
  // 때마다 핸들러가 새로 만들어져 리스너를 떼고 다시 붙였고, 그때마다 합성
  // scroll 이벤트까지 다시 흘렸다.
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
      setPastHero(currentScrollY >= 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // 브라우저가 스크롤 위치를 복원한 채 새로고침되면 scrollY 초기값 0 때문에
    // 투명 내비(흰 글씨)로 그려져 밝은 배경 위에서 읽히지 않는다. 등록 직후
    // 다음 프레임에 한 번 실제 위치를 반영한다(마운트 때 한 번뿐이다).
    // (effect 본문에서 setState를 직접 부르면 연쇄 렌더를 유발하므로 프레임을 넘긴다)
    const frame = requestAnimationFrame(handleScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  // 링크 클릭 외의 경로(브라우저 뒤로/앞으로)로 라우트가 바뀌면 메뉴가 열린 채 남아
  // 새 페이지를 덮고 body 스크롤까지 잠긴다. Navigation은 라우트 전환에도
  // 언마운트되지 않으므로 pathname 변화를 직접 감지해 닫는다.
  // (EditableRichText와 같은 파생 상태 패턴 — effect + setState의 연쇄 렌더를 피한다)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

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
