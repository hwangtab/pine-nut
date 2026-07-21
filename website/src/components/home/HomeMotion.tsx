"use client";

import { useEffect, useState } from "react";
import { useReveal } from "@/lib/use-reveal";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function AnimatedCounter({
  target,
  suffix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const { ref, inView } = useReveal<HTMLSpanElement>("0px 0px -100px 0px");
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) return; // 아래 렌더에서 target을 바로 표시
    let raf = 0;
    let startTs = 0;
    const durationMs = duration * 1000;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / durationMs, 1);
      // easeOut
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  const reduce = prefersReducedMotion();
  return (
    <span ref={ref}>
      {reduce ? target : displayed}
      {suffix}
    </span>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** @deprecated framer 시절 y 이동거리 — CSS 리빌은 고정 24px 사용 */
  y?: number;
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
