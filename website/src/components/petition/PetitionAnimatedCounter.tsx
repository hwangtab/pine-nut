"use client";

import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
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
    if (prefersReducedMotion()) return; // 아래 렌더에서 target 직접 표시
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

  const shown = prefersReducedMotion() ? target : value;

  return (
    <span className="rise-in text-5xl sm:text-6xl font-black text-[var(--color-warm)]">
      {shown.toLocaleString(locale)}
    </span>
  );
}
