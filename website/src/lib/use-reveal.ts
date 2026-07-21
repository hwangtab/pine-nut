"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 스크롤 진입 감지 훅(framer-motion 대체). 요소가 뷰포트에 들어오면 한 번만
 * inView=true로 바뀐다. IntersectionObserver 미지원 환경에선 즉시 true.
 * CSS `.reveal` + `.is-visible` 토글에 사용.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "0px 0px -80px 0px",
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, inView]);

  return { ref, inView };
}
