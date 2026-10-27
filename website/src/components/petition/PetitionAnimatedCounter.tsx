"use client";

import { useEffect, useState } from "react";

// matchMedia는 이펙트 안에서만 읽는다 — 렌더 중에 읽으면 SSR(항상 false)과
// 클라이언트 첫 렌더가 갈라져 하이드레이션 불일치가 난다.
function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export default function PetitionAnimatedCounter({
  target,
  locale = "ko-KR",
}: {
  target: number;
  locale?: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }
    let raf = 0;
    let startTs = 0;
    const durationMs = 2000;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span className="rise-in font-serif-display font-bold text-4xl sm:text-5xl text-[var(--color-warm)]">
      {value.toLocaleString(locale)}
    </span>
  );
}
