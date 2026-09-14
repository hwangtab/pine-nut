"use client";

/* 포스터에서 가져온 장치들. 마을 잔치가 꽃이었다면 이번은 톱날이다.
   전부 장식이라 aria-hidden 고정, 색은 currentColor 로만 받는다. */

/** 포스터를 가로지르는 붉은 지그재그 띠. 잘린 단면이자 톱날이다.
    페이지에서 섹션과 섹션 사이를 끊는 데 쓴다 — 스크롤을 내릴 때마다
    같은 띠가 한 번씩 지나가면서 포스터의 형태 언어가 페이지를 묶는다. */

export function SawEdge({
  className = "",
  teeth = 2,
}: {
  className?: string;
  /** 띠가 꺾이는 횟수. 좁은 화면에서는 적게 꺾어야 각이 살아난다. */
  teeth?: number;
}) {
  // 위아래 두 선을 같은 주기로 그려 일정한 두께의 띠를 만든다.
  const W = 1200;
  const H = 120;
  const band = 52;
  const step = W / (teeth * 2);
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= teeth * 2; i += 1) {
    const x = step * i;
    const y = i % 2 === 0 ? 18 : H - band - 18;
    top.push(`${x},${y}`);
    bottom.push(`${x},${y + band}`);
  }
  const d = `M${top.join(" L")} L${bottom.reverse().join(" L")} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/* 거친 인쇄 질감. 화면 전체에 feTurbulence 를 걸면 리페인트가 무거워지므로
   작은 타일 하나를 만들어 CSS 로 반복시킨다. 마을 잔치와 같은 방식이되,
   어두운 배경 위에 얹으므로 screen 합성에 성글게 깐다. */

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
      style={{
        backgroundImage: `url("${GRAIN_TILE}")`,
        backgroundRepeat: "repeat",
      }}
      aria-hidden="true"
    />
  );
}

/** 잘린 그루터기의 나이테. 브리핑 섹션의 숫자 뒤에 옅게 깐다 —
    베어진 뒤에야 보이는 무늬라는 것이 이 페이지의 논지와 맞는다. */

export function StumpRings({ className = "" }: { className?: string }) {
  // 간격을 일정하게 두지 않는다. 나이테는 해마다 두께가 다르다.
  const radii = [14, 26, 33, 45, 52, 67, 74, 88, 97, 112, 124, 139];
  return (
    <svg
      viewBox="-160 -160 320 320"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {radii.map((r, i) => (
        <circle
          key={r}
          r={r}
          stroke="currentColor"
          strokeWidth={i % 3 === 0 ? 2.4 : 1.2}
          // 나이테는 완전한 동심원이 아니다. 중심을 조금씩 어긋내야 나무처럼 보인다.
          cx={Math.sin(i * 1.7) * 5}
          cy={Math.cos(i * 2.3) * 4}
        />
      ))}
    </svg>
  );
}
