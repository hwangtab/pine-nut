"use client";

import { useId } from "react";

/* 포스터의 형태 언어는 '잘린 단면'이다. 마을 잔치가 꽃이었다면 이번은 그루터기다.
   전부 장식이라 aria-hidden 고정. */

// 나이테. 간격을 고르게 두지 않는다 — 해마다 두께가 다르고, 고른 동심원은
// 표적(target)처럼 보여서 나무로 읽히지 않는다.
const RINGS = [
  { r: 11, w: 1 },
  { r: 19, w: 2.6 },
  { r: 26, w: 1 },
  { r: 34, w: 1 },
  { r: 43, w: 3 },
  { r: 49, w: 1 },
  { r: 58, w: 1 },
  { r: 68, w: 2.4 },
  { r: 75, w: 1 },
  { r: 86, w: 1 },
  { r: 94, w: 3.2 },
  { r: 101, w: 1 },
  { r: 112, w: 1 },
  { r: 121, w: 2.2 },
  { r: 129, w: 1 },
  { r: 138, w: 1 },
];

const FACE = "#6E1F14"; // 단면의 속살
const RING = "#C2503C"; // 나이테
const BARK = "#2A0C07"; // 껍질

// 그루터기 표면에서 중심으로 뻗는 건조 균열. 나이테만 그리면 과녁이나 LP 판으로
// 읽히는데, 이 균열 몇 개가 들어가면 단번에 나무가 된다.
const CHECKS = [
  { a: -68, from: 24, to: 140 },
  { a: 24, from: 46, to: 146 },
  { a: 133, from: 88, to: 146 },
  { a: -142, from: 108, to: 146 },
];

function RingFace() {
  // 속심은 가운데 있지 않다. 바깥으로 갈수록 중심이 제자리를 찾아가도록
  // 어긋남을 반지름에 반비례시키면 실제 나무의 편심 성장처럼 보인다.
  const off = (r: number, base: number) => base * (1 - r / 150);

  return (
    <g>
      <circle r="146" fill={FACE} />
      {RINGS.map(({ r, w }, i) => (
        <ellipse
          key={r}
          rx={r}
          // 완전한 원이 아니라 아주 살짝 눌린 타원이어야 손으로 자란 것처럼 보인다.
          ry={r * (0.9 + 0.05 * Math.sin(i * 1.3))}
          fill="none"
          stroke={RING}
          strokeWidth={w}
          strokeOpacity={w > 2 ? 0.8 : 0.45}
          cx={off(r, 26)}
          cy={off(r, -14)}
        />
      ))}
      {CHECKS.map(({ a, from, to }) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={Math.cos(rad) * from}
            y1={Math.sin(rad) * from}
            x2={Math.cos(rad) * to}
            y2={Math.sin(rad) * to}
            stroke={BARK}
            strokeWidth="3.5"
            strokeOpacity="0.55"
            strokeLinecap="round"
          />
        );
      })}
      <circle r="146" fill="none" stroke={BARK} strokeWidth="11" />
    </g>
  );
}

/**
 * 베이는 중인 그루터기 단면.
 *
 * 핵심은 톱자국 위아래가 어긋나 있다는 것이다. 붉은 줄 하나를 긋는 것보다
 * 이 어긋남이 '잘렸다'를 훨씬 잘 말한다 — 아직 쓰러지지 않았을 뿐 이미
 * 분리됐다는 상태를 한 장면에 담는다.
 *
 * @param split 윗동강이 오른쪽으로 밀린 정도(뷰박스 단위)
 */
export function StumpFace({ className = "", split = 9 }: { className?: string; split?: number }) {
  const id = useId();
  return (
    <svg viewBox="-170 -170 340 340" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-up`}>
          <rect x="-190" y="-190" width="380" height="186" />
        </clipPath>
        <clipPath id={`${id}-down`}>
          <rect x="-190" y="4" width="380" height="186" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-down)`}>
        <RingFace />
      </g>
      <g clipPath={`url(#${id}-up)`} transform={`translate(${split} -3) rotate(-1.4)`}>
        <RingFace />
      </g>
    </svg>
  );
}

/**
 * 두 단 사이의 톱질 경계.
 *
 * 앞선 판본은 띠 하나를 허공에 띄웠는데, 위아래 어디에도 붙지 않아 아무것도
 * 뜻하지 않는 장식이 됐다. 이번엔 아랫단의 바탕색이 톱니로 윗단을 물어 올라가고
 * 그 경계선만 붉게 그어, 경계 자체가 톱자국이 되게 한다.
 *
 * @param fill 아래쪽 단의 배경색(톱니를 이 색으로 채운다)
 */
export function SawBoundary({
  className = "",
  fill = "var(--color-bg)",
  teeth = 7,
}: {
  className?: string;
  fill?: string;
  teeth?: number;
}) {
  const W = 1200;
  const H = 80;
  const step = W / teeth;
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i += 1) {
    // 톱니 끝을 조금씩 다르게 둔다. 자로 잰 듯한 톱니는 톱이 아니라 패턴이다.
    const jitter = ((i * 37) % 11) - 5;
    pts.push(`${step * i},${(i % 2 === 0 ? 16 : 60) + jitter}`);
  }
  const firstY = pts[0].split(",")[1];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path d={`M0,${H} L0,${firstY} L${pts.join(" L")} L${W},${H} Z`} fill={fill} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="#D93A2B"
        strokeWidth="5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* 거친 인쇄 질감. 화면 전체에 feTurbulence 를 걸면 리페인트가 무거워지므로
   작은 타일 하나를 만들어 CSS 로 반복시킨다. 어두운 배경 위에 얹으므로
   screen 합성에 성글게 깐다. */
const GRAIN_TILE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
       <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="3" stitchTiles="stitch"/></filter>
       <rect width="180" height="180" filter="url(#n)" opacity="0.9"/>
     </svg>`.replace(/\s+/g, " "),
  );

export function PosterGrain({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 mix-blend-screen ${className}`}
      style={{ backgroundImage: `url("${GRAIN_TILE}")`, backgroundRepeat: "repeat" }}
      aria-hidden="true"
    />
  );
}
