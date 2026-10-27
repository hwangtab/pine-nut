"use client";

import { useEffect, useState } from "react";
import { useReveal } from "@/lib/use-reveal";

// matchMedia는 이펙트 안에서만 읽는다 — 렌더 중에 읽으면 SSR(항상 false)과
// 클라이언트 첫 렌더가 갈라져 하이드레이션 불일치가 난다.
function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
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
  // 기본 표시는 target — SSR HTML·JS 미실행·크롤러에도 실제 숫자가 보인다.
  // 화면에 들어오고 모션이 허용될 때만 이펙트에서 0부터 다시 센다(애니메이션 중
  // 값만 따로 들고, 끝나면 null로 돌려 target 변경도 그대로 따라간다).
  const [animated, setAnimated] = useState<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!inView) {
      // 아직 화면 밖이면 보이지 않는 사이에 0으로 내려 둔다 — 들어오는 순간
      // target→0으로 튀는 깜빡임 없이 바로 세기 시작한다.
      const raf = requestAnimationFrame(() => setAnimated(0));
      return () => cancelAnimationFrame(raf);
    }
    let raf = 0;
    let startTs = 0;
    const durationMs = duration * 1000;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / durationMs, 1);
      // easeOut
      const eased = 1 - Math.pow(1 - p, 3);
      if (p < 1) {
        setAnimated(Math.round(eased * target));
        raf = requestAnimationFrame(tick);
      } else {
        setAnimated(null);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setAnimated(null);
    };
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {animated ?? target}
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
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
