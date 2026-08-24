"use client";

import { useId } from "react";

/* 포스터에서 가져온 장치들. 단색 배경만으로는 포스터의 인상이 남지 않는다.
   전부 장식이라 aria-hidden 고정, 색은 currentColor 로만 받는다. */

/** 포스터 왼쪽의 꽃 그래픽. 연한 잎 위에 먹색 꽃이 겹쳐 있는 2겹 구조다. */
export function PosterFlower({
  className = "",
  petals = 8,
  rotate = 0,
}: {
  className?: string;
  petals?: number;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <g transform={`rotate(${rotate})`}>
        {Array.from({ length: petals }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-54"
            rx="21"
            ry="44"
            fill="currentColor"
            transform={`rotate(${(360 / petals) * i})`}
          />
        ))}
        <circle r="27" fill="currentColor" />
      </g>
    </svg>
  );
}

/* 거친 인쇄 질감. 화면 전체에 feTurbulence 를 걸면 리페인트가 무거워지므로
   작은 타일 하나를 만들어 CSS 로 반복시킨다. */
const GRAIN_TILE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
       <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="2" stitchTiles="stitch"/></filter>
       <rect width="160" height="160" filter="url(#n)" opacity="0.85"/>
     </svg>`.replace(/\s+/g, " "),
  );

export function PosterGrain({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 mix-blend-multiply ${className}`}
      style={{ backgroundImage: `url("${GRAIN_TILE}")`, backgroundRepeat: "repeat" }}
      aria-hidden="true"
    />
  );
}

/** 포스터 오른쪽 아래의 찢은 종이 띠. 라인업이 얹혀 있던 그 조각이다. */
export function TornStrip({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 600 90"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}-torn`}>
          <path
            d="M0,16 L28,9 L61,17 L96,7 L131,15 L167,6 L204,16 L241,8 L279,18 L318,9 L357,17
               L395,7 L433,16 L470,8 L507,17 L544,9 L578,16 L600,10 L600,74 L571,82 L534,73
               L497,83 L459,72 L421,82 L383,71 L344,81 L305,70 L266,80 L228,70 L190,81
               L152,71 L114,82 L76,72 L38,82 L0,73 Z"
          />
        </clipPath>
      </defs>
      <rect width="600" height="90" fill="currentColor" clipPath={`url(#${id}-torn)`} />
    </svg>
  );
}
