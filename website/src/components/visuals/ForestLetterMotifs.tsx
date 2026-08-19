"use client";

import { useId } from "react";

/* "숲의 편지" SVG 모티프 모음. 전부 장식 요소 — aria-hidden 고정, 색은 currentColor/토큰만 사용 */

export function ContourBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <svg className="absolute -right-24 -top-24 w-[560px] h-[560px] opacity-[0.07] text-[var(--color-forest)]" viewBox="0 0 400 400" fill="none">
        {[60, 95, 130, 165, 200].map((r) => (
          <path
            key={r}
            d={`M ${200 - r},200 C ${200 - r},${200 - r * 0.9} ${200 - r * 0.4},${200 - r} 200,${200 - r} C ${200 + r * 0.7},${200 - r} ${200 + r},${200 - r * 0.5} ${200 + r},200 C ${200 + r},${200 + r * 0.8} ${200 + r * 0.5},${200 + r} 200,${200 + r} C ${200 - r * 0.6},${200 + r} ${200 - r},${200 + r * 0.7} ${200 - r},200 Z`}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}

export function RidgeDivider({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div
      className={`w-full overflow-hidden leading-[0] pointer-events-none ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="block w-full h-10 sm:h-14 md:h-20">
        <path
          d="M0,96 L0,64 Q180,20 360,52 Q540,10 720,44 Q900,6 1080,40 Q1260,18 1440,56 L1440,96 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export function PineConeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="24" cy="36" rx="15" ry="22" opacity="0.25" />
      <path d="M24 12c-3 4-9 6-9 6 3 2 5 5 5 5-4 1-7 4-7 4 3 2 5 5 5 5-3 1-6 4-6 4 4 2 6 5 6 5-2 1-4 3-4 3 5 4 10 5 10 5s5-1 10-5c0 0-2-2-4-3 0 0 2-3 6-5 0 0-3-3-6-4 0 0 2-3 5-5 0 0-3-3-7-4 0 0 2-3 5-5 0 0-6-2-9-6z" />
      <path d="M24 4c-1.5 2.5-1.5 5 0 8 1.5-3 1.5-5.5 0-8z" opacity="0.7" />
    </svg>
  );
}

export function PostmarkStamp({
  className = "",
  label = "PUNGCHEONRI",
  sublabel = "since 2019",
}: {
  className?: string;
  label?: string;
  sublabel?: string;
}) {
  // 한 페이지에 2개 이상 렌더될 수 있으므로 arc path의 DOM id는 인스턴스마다 고유해야 한다
  const arcId = `postmark-arc-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" opacity="0.75">
        <circle cx="60" cy="60" r="52" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="44" strokeWidth="1" />
        <path d="M76 30 Q104 44 108 76 M12 44 Q16 24 40 14" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <defs>
        <path id={arcId} d="M 60,60 m -34,0 a 34,34 0 1,1 68,0" />
      </defs>
      <text fontSize="11" fontWeight="700" letterSpacing="2.5" fill="currentColor" opacity="0.85">
        <textPath href={`#${arcId}`} startOffset="8%">{label}</textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" fontSize="10" fontStyle="italic" fill="currentColor" opacity="0.7">
        {sublabel}
      </text>
    </svg>
  );
}

export function TrailFootprints({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 120" fill="currentColor" className={className} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={i}
          cx={i % 2 === 0 ? 8 : 16}
          cy={12 + i * 24}
          rx="3.5"
          ry="5"
          opacity={0.5 - i * 0.06}
          transform={`rotate(${i % 2 === 0 ? -12 : 12} ${i % 2 === 0 ? 8 : 16} ${12 + i * 24})`}
        />
      ))}
    </svg>
  );
}
