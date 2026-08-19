# "숲의 편지" 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 풍천리 사이트 공개 페이지 전체를 "숲의 편지" 컨셉(한지·종이 재질, 마루 부리 세리프, SVG 자연 모티프, 서명=답장 은유)으로 리디자인한다.

**Architecture:** 기존 리퀴드 글래스 재질 시스템을 종이 재질 시스템으로 단계적 치환한다. 신규 시스템을 먼저 추가(1단계) → 홈·공통 컴포넌트·서브페이지를 순서대로 이주(2–4단계) → 마지막에 글래스 CSS를 제거하고 잔여 참조를 검증(5단계)한다. admin 빌더 인프라(`ManagedSection`/`OrderedSectionGroup`/`EditableText`/`EditableImage`/`EditableList`/`EditableLink`)와 모든 `contentKey`는 절대 변경하지 않는다 — 바꾸는 것은 className과 장식 마크업뿐이다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4(@theme inline), 셀프호스팅 웹폰트(MaruBuri woff2, next/font/google), 인라인 SVG.

**Spec:** `docs/superpowers/specs/2026-08-19-forest-letter-redesign-design.md`

## Global Constraints

- 모든 npm 명령은 `website/` 디렉터리에서 실행한다.
- 각 태스크 종료 조건: `npm run lint` 통과 + `npm run build` 통과. 시각 태스크는 dev 서버(`PORT=3001 npm run dev`)에서 chrome-devtools MCP로 데스크톱(1440×900)·모바일(390×844) 스크린샷 확인까지.
- 커밋 메시지는 한국어, "변경 요약 + 영향 범위" 패턴.
- **콘텐츠 불변**: `EditableText`/`EditableList`의 `contentKey`와 `defaultValue`/`defaultItems`의 문안·수치·사진 URL은 그대로 둔다. 기존 contentKey의 이름 변경·삭제·신규 추가 모두 금지. 문안 예외는 spec §8이 허용한 딱 1곳: Task 9의 CTA 제목(`home.cta.heading` → "숲에 답장을 보내주세요"). 그 외 모든 `defaultValue`/`defaultItems`는 한 글자도 바꾸지 않는다.
- **빌더 보존**: `ManagedSection`의 `page`/`sectionId`/`visibilityContentKey`/`section` prop 불변. `defaultClassName`만 교체 가능.
- **접근성 보존**: `prefers-reduced-motion`/`prefers-reduced-transparency` 폴백, `:focus-visible` 스타일, skip 링크, `word-break: keep-all`, 최소 터치 타깃 44px.
- **성능 보존**: LCP 요소(히어로 이미지·타이틀)는 CSS 애니메이션만 사용(초기 `opacity:0` 금지), `priority`/`sizes` prop 유지, 폰트는 `font-display: swap`.
- **/admin 영역 및 `--color-admin-*` 토큰은 건드리지 않는다.**
- AI 생성 일러스트 금지. 모든 그래픽은 인라인 SVG/CSS로 작성한다.
- 글래스 클래스(`glass`, `glass-strong`, `glass-subtle`, `glass-dark`, `glass-chip`, `glass-btn--glass`, `frost`, `frost-sheet`, `frost-field`)의 CSS 정의 삭제는 **Task 21 전까지 금지** — 이주가 끝나기 전 삭제하면 아직 이주 안 된 페이지가 깨진다.

### 클래스 치환 표 (전 태스크 공통 참조)

| 기존 | 신규 | 비고 |
|---|---|---|
| `glass`, `glass-strong` (패널) | 패널 제거 → 사진 위 직접 타이포 + 그라디언트 | 히어로 계열 |
| `frost` (본문 카드·폼) | `paper` | |
| `frost-field` | `paper-field` | |
| `frost-sheet` | `paper-sheet` | 모바일 메뉴 |
| `glass-dark`, `glass-chip` (사진 위 칩) | `ink-chip` | |
| `glass-btn glass-btn--primary` | `letter-btn letter-btn--primary` | |
| `glass-btn glass-btn--glass` | `letter-btn letter-btn--outline` | |
| `bg-[var(--color-sky)]` (대형 배경) | `bg-[var(--color-deep)]` | 네이비 밴드 퇴출 |
| `bg-[#0a0a0a]` | `bg-[var(--color-deep)]` | 검정 밴드 퇴출 |
| `bg-[var(--color-bg-warm)]` (섹션 배경) | `bg-[var(--color-bg)]` | 패치워크 제거. 구분 필요시에만 `bg-[var(--color-bg-moss)]` |
| 섹션 제목 `text-center` + `font-black` | 좌측 정렬 + `font-serif-display font-bold` | 히어로·CTA 등 의도적 센터는 유지 |

---

## Phase 1 — 기반: 폰트·토큰·모티프

### Task 1: MaruBuri·나눔 펜 스크립트 폰트 도입

**Files:**
- Create: `website/public/fonts/maruburi/` (woff2 3종)
- Create: `website/src/app/fonts/maruburi.css`
- Modify: `website/src/app/layout.tsx` (나눔 펜 스크립트 추가)
- Modify: `website/src/app/globals.css:1` (import 추가), `:54` (`--font-serif-display` 값 교체), `@theme`에 `--font-hand` 추가

**Interfaces:**
- Produces: Tailwind 유틸리티 `font-serif-display`(MaruBuri 우선), `font-hand`(나눔 펜 스크립트). CSS 변수 `--font-hand`.
- 기존 `font-serif-display` 사용처는 자동으로 MaruBuri로 승격된다(변수명 재사용).

- [ ] **Step 1: MaruBuri woff2 다운로드**

네이버 공식 웹폰트 CSS에서 woff2 URL을 추출해 받는다:

```bash
cd website
curl -s https://hangeul.pstatic.net/hangeul_static/css/maru-buri.css | grep -o 'https://[^)"]*woff2' | sort -u
mkdir -p public/fonts/maruburi
# spec §10: 디스플레이 폰트는 웨이트 1–2개만 — Regular(400)·Bold(700) 2종으로 한정
for w in Regular Bold; do
  curl -sfL "https://hangeul.pstatic.net/hangeul_static/webfont/MaruBuri/MaruBuri-${w}.woff2" -o "public/fonts/maruburi/MaruBuri-${w}.woff2"
done
ls -la public/fonts/maruburi/   # 2개 파일, 각 수백 KB~1MB대인지 확인. 0바이트면 실패
```

URL 패턴이 다르면 첫 명령의 추출 결과에서 실제 URL을 쓴다. 그래도 실패하면 https://hangeul.naver.com 의 마루 부리 배포 페이지에서 수동 다운로드한다. 라이선스는 SIL OFL(셀프호스팅 허용).

- [ ] **Step 2: `src/app/fonts/maruburi.css` 작성**

```css
/* MaruBuri (네이버 글꼴, SIL OFL). 디스플레이 전용 — 필요한 웨이트 3종만 셀프호스팅 */
@font-face {
  font-family: 'MaruBuri';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(/fonts/maruburi/MaruBuri-Regular.woff2) format('woff2');
}
@font-face {
  font-family: 'MaruBuri';
  font-style: normal;
  font-display: swap;
  font-weight: 700;
  src: url(/fonts/maruburi/MaruBuri-Bold.woff2) format('woff2');
}
```

- [ ] **Step 3: globals.css 연결**

`globals.css` 맨 위 import 블록을 다음으로:

```css
@import './fonts/pretendard.css';
@import './fonts/maruburi.css';
@import "tailwindcss";
```

`@theme inline` 안의 기존 `--font-serif-display` 줄을 첫 줄로 교체하고, 둘째 줄(`--font-hand`)을 신규 추가한다:

```css
--font-serif-display: 'MaruBuri', var(--font-nanum-myeongjo), 'Nanum Myeongjo', serif;
--font-hand: var(--font-nanum-pen), 'Nanum Pen Script', cursive;
```

- [ ] **Step 4: layout.tsx에 나눔 펜 스크립트 추가**

`src/app/layout.tsx`의 기존 `nanumMyeongjo` 선언(줄 9 부근)과 같은 패턴으로 추가하고, `<html>` className에 변수를 병기한다:

```tsx
import { Nanum_Myeongjo, Nanum_Pen_Script } from "next/font/google";

const nanumPen = Nanum_Pen_Script({
  weight: "400",
  variable: "--font-nanum-pen",
  // subsets/preload 옵션은 파일 내 nanumMyeongjo 선언과 동일하게 맞춘다
});
```

```tsx
<html lang="ko" className={`${nanumMyeongjo.variable} ${nanumPen.variable}`}>
```

- [ ] **Step 5: 검증 — 빌드 + 폰트 적용 확인**

```bash
npm run lint && npm run build
PORT=3001 npm run dev &
sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001   # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/fonts/maruburi/MaruBuri-Bold.woff2   # 200
```

chrome-devtools `evaluate_script`로 확인: `() => { const el = document.querySelector('.font-serif-display') || document.body; return getComputedStyle(el).fontFamily; }` — 홈에서 인용문 요소(`font-serif-display`)의 computed fontFamily에 `MaruBuri`가 포함되면 성공.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "마루 부리·나눔 펜 스크립트 셀프호스팅 도입 — font-serif-display를 MaruBuri 우선으로 승격"
```

### Task 2: 디자인 토큰 교체 + 종이 재질 시스템 추가

**Files:**
- Modify: `website/src/app/globals.css` (`:root` 토큰 값 교체 + 종이 재질 클래스 추가. 글래스 클래스는 그대로 둔다)

**Interfaces:**
- Produces (CSS 변수): `--color-bg: #FAF7EF`, `--color-bg-moss: #EFF2E4`, `--color-deep: #1E3317`, `--color-text: #22301F`, `--color-text-muted: #5C6653`, `--color-border: #E3DFD0`. 기존 변수명 `--color-forest`/`--color-warm`/`--color-earth`/`--color-sky` 등은 이름·값 유지.
- Produces (클래스): `.paper`, `.paper-tilt-l`, `.paper-tilt-r`, `.paper-field`, `.paper-sheet`, `.photo-frame`, `.ink-chip`, `.letter-btn`, `.letter-btn--primary`, `.letter-btn--outline`, `.stamp-badge`, `.trail-line`
- `@theme inline`에 `--color-bg-moss`, `--color-deep` 매핑 추가 → Tailwind에서 `bg-[var(--color-bg-moss)]`, `bg-[var(--color-deep)]`, `text-[var(--color-deep)]` 사용 가능.

- [ ] **Step 1: `:root` 토큰 값 교체**

`globals.css`의 `:root` 블록에서 기존 5개 값(`--color-bg`/`--color-bg-warm`/`--color-text`/`--color-text-muted`/`--color-border`)을 교체하고 2개(`--color-bg-moss`/`--color-deep`)를 신설한다. 나머지(특히 `--color-admin-*`, `--color-danger*`, `--color-overlay-*`)는 유지한다. 파일 상단 color diet 주석의 "sky / earth" 줄에 "(대형 배경 사용 금지 — 뱃지 등 소형 기능 요소만)"을 덧붙인다.

```css
--color-bg: #FAF7EF;          /* 한지 크림 */
--color-bg-warm: #F3EFE2;     /* 옅은 모래빛 — 한지와 이어지는 톤 */
--color-bg-moss: #EFF2E4;     /* 옅은 이끼 세이지 — 보조 배경 */
--color-deep: #1E3317;        /* 깊은 숲 그린 — 어두운 밴드 전용 */
--color-text: #22301F;        /* 침엽수 차콜 (순검정 금지) */
--color-text-muted: #5C6653;  /* 이끼 회녹 */
--color-border: #E3DFD0;
```

`@theme inline`에 두 줄 추가:

```css
--color-bg-moss: var(--color-bg-moss);
--color-deep: var(--color-deep);
```

- [ ] **Step 2: 종이 재질 시스템 CSS 추가**

`globals.css` 끝(글래스 폴백 블록 뒤)에 추가한다. 글래스 블록은 삭제하지 않는다.

```css
/* ────────────────────────────────────────────────────────────
   종이 재질 시스템 ("숲의 편지")
   컴포넌트는 아래 클래스 하나만 고른다. 값은 직접 만지지 않는다.
   ──────────────────────────────────────────────────────────── */

/* 종이 카드 — 본문·폼·증언 편지지의 기본 표면 */
.paper {
  position: relative;
  background: #FFFDF7;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: 0 1px 2px rgb(34 48 31 / 0.05), 0 10px 28px rgb(34 48 31 / 0.08);
}
/* 옅은 섬유 질감 (SVG feTurbulence 노이즈) */
.paper::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
}
/* 앨범에 붙인 사진처럼 살짝 기울인 변형 */
.paper-tilt-l { transform: rotate(-1.1deg); }
.paper-tilt-r { transform: rotate(1.1deg); }
@media (prefers-reduced-motion: reduce) {
  .paper-tilt-l, .paper-tilt-r { transform: none; }
}

/* 종이 위 입력 필드 */
.paper-field {
  font: inherit;
  font-size: 15px;
  color: var(--color-text);
  padding: 12px 16px;
  border-radius: 10px;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 2px rgb(34 48 31 / 0.04);
  width: 100%;
}
.paper-field::placeholder {
  color: var(--color-text-muted);
  opacity: 1;
}

/* 전체 화면 시트 (모바일 메뉴) — 불투명 한지 */
.paper-sheet {
  background: var(--color-bg);
  color: var(--color-text);
}

/* 앨범 사진 프레임 — 흰 두꺼운 테두리 + 그림자 */
.photo-frame {
  background: #FFFDF7;
  padding: 10px;
  padding-bottom: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 2px 6px rgb(34 48 31 / 0.08), 0 14px 32px rgb(34 48 31 / 0.1);
}
.photo-frame > img { border-radius: 2px; }

/* 사진 위 소형 칩 (기존 glass-dark/glass-chip 대체) — 잉크 배경 */
.ink-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: var(--radius-pill);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #FFFDF7;
  background: rgb(30 51 23 / 0.82);
}

/* 편지 버튼 */
.letter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  border: 0;
  font: inherit;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: transform var(--motion-press), box-shadow var(--motion-hover), background var(--motion-hover);
}
.letter-btn:active { transform: scale(0.97); }
.letter-btn--primary {
  background: var(--color-warm);
  color: #fff;
  box-shadow: 0 8px 24px rgb(199 80 0 / 0.3);
}
.letter-btn--primary:hover { background: var(--color-warm-light); }
/* 사진 위·어두운 배경 위에서 쓰는 보조 버튼 */
.letter-btn--outline {
  background: rgb(255 253 247 / 0.12);
  border: 1.5px solid rgb(255 253 247 / 0.65);
  color: #FFFDF7;
}
.letter-btn--outline:hover { background: rgb(255 253 247 / 0.22); }

/* 우표 뱃지 — 이중 점선 테두리로 천공 은유 */
.stamp-badge {
  background: #FFFDF7;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 2px 8px rgb(34 48 31 / 0.1);
}
.stamp-badge__inner {
  border: 2px dashed rgb(92 102 83 / 0.45);
  border-radius: 2px;
  padding: 10px 14px;
  text-align: center;
}

/* 오솔길 점선 (타임라인·발자취 연결선) */
.trail-line {
  border-left: 3px dotted rgb(45 80 22 / 0.4);
}
```

- [ ] **Step 3: 검증**

```bash
npm run lint && npm run build
```

dev 서버에서 홈 스크린샷(데스크톱·모바일): 배경이 `#FAFAF5→#FAF7EF`로, 본문 잉크가 초록빛 차콜로 바뀌었고 레이아웃 회귀가 없는지 확인. 글래스 요소들은 아직 그대로여야 정상.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "한지·숲 팔레트로 토큰 교체 + 종이 재질 시스템 추가 — 글래스와 병행(이주 기간 한정)"
```

### Task 3: SVG 모티프 라이브러리

**Files:**
- Create: `website/src/components/visuals/ForestLetterMotifs.tsx`

**Interfaces:**
- Produces (모두 named export, props는 `{ className?: string }` 동일):
  - `ContourBackground` — 섹션 배경용 등고선 패턴. 부모에 `relative` 필요, 자신은 `absolute inset-0` + `aria-hidden`
  - `RidgeDivider` — 능선 실루엣 웨이브. `flip?: boolean` prop 추가(위/아래 방향), 섹션 경계·푸터 상단용
  - `PineConeIcon` — 잣송이 실루엣 아이콘 (`fill="currentColor"`)
  - `PostmarkStamp` — 원형 소인 도장. `label?: string`(기본 "PUNGCHEONRI"), `sublabel?: string`(기본 "since 2019")
  - `TrailFootprints` — 오솔길 발자국 점 장식
- 기존 `HomeVisuals.tsx`의 `PineTreeIcon`/`MountainSilhouette`은 이동하지 않고 그대로 둔다(참조 파일이 많다). 신규 모티프만 이 파일에 모은다.

- [ ] **Step 1: 파일 작성**

```tsx
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
```

- [ ] **Step 2: 검증**

```bash
npm run lint && npm run build
```

아직 아무 데서도 import하지 않으므로 빌드 통과가 곧 검증이다. (tree-shaking으로 번들 영향 0)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "숲의 편지 SVG 모티프 라이브러리 추가 — 등고선·능선·잣송이·소인·발자국"
```

---

## Phase 2 — 홈 재구성

### Task 4: 홈 섹션 배경 재배치 + 히어로 유리 제거

**Files:**
- Modify: `website/src/components/home/HomeClient.tsx` (ManagedSection `defaultClassName`만)
- Modify: `website/src/components/home/HomeHeroSection.tsx` (전면 재작성)
- Modify: `website/src/components/home/HomeConcertBanner.tsx` (글래스 칩 → `ink-chip`)

**Interfaces:**
- Consumes: Task 2의 `letter-btn`/`ink-chip`, Task 3의 `RidgeDivider`, Task 1의 `font-serif-display`
- Produces: 홈 섹션 배경 규칙 — about/impact/hope/quotes는 `bg-[var(--color-bg)]`, cta는 `bg-[var(--color-bg-moss)]`, stats는 `bg-[var(--color-deep)]`. 이후 Task 5–10은 이 배경 위에서 작업한다.
- **콘텐츠 변경 없음**: 히어로 CTA는 기존 스크롤 버튼과 `home.story.cta`("이야기 보기 ↓")를 그대로 두고 클래스만 감빛(`letter-btn--primary`)으로 바꾼다. `EditableLink` 중첩·신규 키 생성 금지(편집 모드 어포던스 충돌 방지).

- [ ] **Step 1: HomeClient.tsx의 defaultClassName 교체**

hero는 그대로 두고 나머지 6개를 다음으로 교체한다(prop은 `defaultClassName`만 변경):

```tsx
// about
defaultClassName="relative overflow-hidden py-24 md:py-36 px-6 bg-[var(--color-bg)]"
// impact
defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg)]"
// hope
defaultClassName="relative overflow-hidden py-24 md:py-36 px-6 bg-[var(--color-bg)]"
// quotes  (네이비 밴드 폐기 — text-white 제거 필수, 내부 잉크는 Task 8이 처리)
defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg)]"
// cta
defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg-moss)]"
// stats
defaultClassName="py-16 md:py-20 px-6 bg-[var(--color-deep)] text-[#FFFDF7]"
```

- [ ] **Step 2: HomeHeroSection.tsx 전면 재작성**

`glass` 패널·`glass-btn--glass`를 제거하고 사진 위 직접 타이포로 바꾼다. `EditableImage`/`EditableText`/`EditableList`의 contentKey·defaultValue·counters는 **전부 그대로**(히어로 CTA 문안 `home.story.cta` = "이야기 보기 ↓"도 불변). 전체 코드:

```tsx
"use client";

import { ChevronDown } from "lucide-react";
import { EditableImage, EditableList, EditableText } from "@/components/editable";
import HomeConcertBanner from "@/components/home/HomeConcertBanner";
import { AnimatedCounter } from "@/components/home/HomeMotion";
import { RidgeDivider } from "@/components/visuals/ForestLetterMotifs";

export default function HomeHeroSection({
  onScrollToStory,
}: {
  onScrollToStory: () => void;
}) {
  return (
    <>
      <EditableImage
        contentKey="home.hero.bgImage"
        defaultSrc="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535387_std.jpg"
        fallbackSrc="/images/forest-aerial.jpg"
        alt="풍천리 마을과 잣나무 숲 드론 항공 사진"
        page="home"
        section="hero"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      {/* 사진을 살리는 얇은 잉크 그라디언트 — 하단은 한지 배경으로 이어진다 */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,20,12,0.55) 0%, rgba(12,20,12,0.32) 48%, rgba(12,20,12,0.18) 72%, rgba(12,20,12,0.05) 88%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="rise-in">
          <HomeConcertBanner />
        </div>

        <div className="rise-in">
          <EditableText
            contentKey="home.hero.title"
            defaultValue="7년, 705번의 외침"
            as="h1"
            page="home"
            section="hero"
            className="font-serif-display font-bold text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[1.16] mb-5 sm:mb-6 [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="rise-in rise-in-1">
          <EditableText
            contentKey="home.hero.subtitle"
            defaultValue="강원도 홍천, 잣나무 숲이 품은 작은 마을 풍천리. 주민들은 7년 넘게 양수발전소 건설에 맞서 삶의 터전과 숲을 지켜오고 있습니다"
            as="p"
            page="home"
            section="hero"
            className="text-balance text-base sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 md:mb-12 [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="rise-in rise-in-2 grid w-full max-w-[22rem] grid-cols-3 items-start gap-3 mx-auto mb-8 sm:max-w-2xl sm:gap-6 sm:mb-12 md:mb-14">
          <EditableList
            contentKey="home.hero.counters"
            defaultItems={[
              { target: "7", suffix: "년+", label: "투쟁 기간" },
              { target: "705", suffix: "회+", label: "집회 횟수" },
              { target: "140", suffix: "개+", label: "연대 단체" },
            ]}
            page="home"
            section="hero"
            fields={[
              { key: "target", label: "숫자" },
              { key: "suffix", label: "접미사" },
              { key: "label", label: "라벨" },
            ]}
          >
            {(items) =>
              items.map((item) => (
                <div key={item.label} className="flex min-w-0 flex-col items-center">
                  <span className="font-serif-display whitespace-nowrap text-2xl sm:text-4xl md:text-5xl font-bold leading-none text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]">
                    <AnimatedCounter target={Number(item.target)} suffix={item.suffix} />
                  </span>
                  <span className="mt-2 text-[11px] leading-tight text-white/70 sm:text-base">
                    {item.label}
                  </span>
                </div>
              ))
            }
          </EditableList>
        </div>

        <div className="rise-in rise-in-3 flex justify-center">
          <button
            type="button"
            onClick={onScrollToStory}
            className="letter-btn letter-btn--primary text-base sm:text-lg"
          >
            <EditableText
              contentKey="home.story.cta"
              defaultValue="이야기 보기 ↓"
              as="span"
              page="home"
              section="hero"
            />
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 sm:bottom-16 sm:right-6">
        <EditableText
          contentKey="home.hero.photoCredit"
          defaultValue="사진: 오마이뉴스"
          as="p"
          page="home"
          section="hero"
          className="text-[10px] text-white/45 sm:text-xs"
        />
      </div>

      <button
        type="button"
        onClick={onScrollToStory}
        aria-label="이야기로 스크롤"
        className="chevron-bounce absolute bottom-8 z-10 hidden sm:block cursor-pointer"
      >
        <ChevronDown className="w-8 h-8 text-white/50" />
      </button>
    </>
  );
}
```

- [ ] **Step 3: HomeConcertBanner.tsx의 글래스 칩 치환**

파일을 읽고 `glass`/`glass-subtle`/`glass-chip` 계열 클래스를 `ink-chip`으로 바꾼다. 링크·문구·contentKey는 그대로.

- [ ] **Step 4: 검증**

```bash
npm run lint && npm run build
```

dev 서버 + chrome-devtools로 홈 데스크톱(1440×900)·모바일(390×844) 스크린샷. 체크리스트: 유리 패널이 사라지고 사진이 보이는가 / 제목이 MaruBuri 세리프인가 / 하단 능선이 한지색으로 본문과 이어지는가 / 감빛 버튼이 1개인가. 아래 섹션들은 아직 구식이어도 정상.

풀페이지 스크린샷 시 스크롤 리빌 때문에 하단이 비어 보인다. `navigate_page`의 `initScript`로 무효화한다:

```js
document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='.reveal{opacity:1!important;transform:none!important}';document.head.appendChild(s);});
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "홈 히어로 유리 패널 제거 + 사진 직접 타이포·능선 경계 + 섹션 배경 패치워크 정리"
```

### Task 5: HomeAboutSection — 편지의 도입

**Files:**
- Modify: `website/src/components/home/HomeAboutSection.tsx`

**Interfaces:**
- Consumes: `ContourBackground`, `photo-frame`, `paper-tilt-l`, `font-serif-display`, `font-hand`
- contentKey 7개(`home.about.heading`/`paragraph1~3`/`forestImage`/`forestPhotoCredit`) 전부 유지

- [ ] **Step 1: 재작성**

센터 정렬을 좌측 정렬로, 아이콘을 등고선 배경으로, 사진을 앨범 프레임으로 바꾼다. render 반환부를 다음 구조로 교체한다(EditableText/EditableImage의 contentKey·defaultValue·page·section prop은 기존 값 그대로 복사):

```tsx
<div ref={storyRef}>
  <ContourBackground />
  <div className="relative max-w-3xl mx-auto">
    <FadeIn>
      <PineTreeIcon className="w-12 h-12 mb-6 text-[var(--color-forest)]" />
    </FadeIn>
    <FadeIn delay={0.1}>
      <EditableText … contentKey="home.about.heading"
        className="font-serif-display font-bold text-3xl sm:text-4xl md:text-5xl mb-8 text-[var(--color-text)]" />
    </FadeIn>
    <FadeIn delay={0.15}>
      <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
        <EditableText … contentKey="home.about.paragraph1" />
      </div>
    </FadeIn>
    <FadeIn delay={0.2}>
      <figure className="photo-frame paper-tilt-l my-12">
        <EditableImage … contentKey="home.about.forestImage" className="w-full rounded-[2px]" />
        <figcaption>
          <EditableText … contentKey="home.about.forestPhotoCredit"
            className="font-hand text-lg text-[var(--color-text-muted)] mt-2 text-right pr-1" />
        </figcaption>
      </figure>
    </FadeIn>
    <FadeIn delay={0.2}>
      <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
        <EditableText … contentKey="home.about.paragraph2" />
        <EditableText … contentKey="home.about.paragraph3" />
      </div>
    </FadeIn>
  </div>
</div>
```

import에 `ContourBackground`를 추가한다(`@/components/visuals/ForestLetterMotifs`).

- [ ] **Step 2: 검증 + Commit**

`npm run lint && npm run build`, 홈 스크린샷으로 좌정렬·프레임·등고선 확인.

```bash
git add -A && git commit -m "홈 소개 섹션을 편지 도입부로 — 좌정렬 세리프·앨범 사진 프레임·등고선 배경"
```

### Task 6: HomeImpactSection — 잃게 될 것들

**Files:**
- Modify: `website/src/components/home/HomeImpactSection.tsx`

**Interfaces:**
- Consumes: `paper`, `font-serif-display`
- contentKey `home.impact.heading`/`subtitle`/`cards` 유지. 파일 상단의 `gradients`·`svgIcons` 배열은 통째로 삭제

- [ ] **Step 1: 재작성**

단색 그라디언트 카드 → 종이 카드 + 번호 + 잉크 고대비(홈에서 가장 무거운 잉크). 헤딩 블록은 좌정렬:

```tsx
<FadeIn className="mb-16 max-w-3xl">
  <EditableText … contentKey="home.impact.heading"
    className="font-serif-display font-bold text-3xl sm:text-4xl md:text-5xl mb-4 text-[var(--color-text)]" />
  <EditableText … contentKey="home.impact.subtitle"
    className="text-balance text-lg text-[var(--color-text-muted)]" />
</FadeIn>
```

카드 렌더러:

```tsx
{(items) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
    {items.map((card, i) => (
      <FadeIn key={card.title} delay={i * 0.1}>
        <div className="paper h-full p-8">
          <div className="relative z-[1]">
            <span className="font-serif-display text-sm font-bold tracking-[0.25em] text-[var(--color-forest)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif-display font-bold text-2xl mt-3 mb-4 text-[var(--color-text)]">
              {card.title}
            </h3>
            <p className="leading-relaxed text-[var(--color-text)]/85">{card.desc}</p>
          </div>
        </div>
      </FadeIn>
    ))}
  </div>
)}
```

- [ ] **Step 2: 검증 + Commit**

`npm run lint && npm run build`, 스크린샷 확인 후:

```bash
git add -A && git commit -m "홈 위협 섹션 단색 카드 폐기 — 종이 카드·번호·잉크 고대비로 재구성"
```

### Task 7: HomeHopeSection — 7년의 발자취

**Files:**
- Modify: `website/src/components/home/HomeHopeSection.tsx`

**Interfaces:**
- Consumes: `trail-line`, `photo-frame`, `paper-tilt-r`, `font-hand`, `PineConeIcon`
- contentKey `home.hope.eyebrow`/`heading`/`subtitle`/`cards`/`protestPhoto`/`protestPhotoCredit` 유지. 파일 상단 `icons` 배열 삭제

- [ ] **Step 1: 재작성**

3개 카드 그리드 → 오솔길 점선을 따라 내려오는 이정표 리스트. 헤딩 블록은 좌정렬(`text-center` 제거, `mx-auto` 제거), eyebrow는 유지하되 `font-hand text-xl normal-case tracking-normal text-[var(--color-forest)]`로(손글씨 허용처: 여는 말). 카드 렌더러:

```tsx
{(items) => (
  <div className="trail-line relative mt-14 ml-2 space-y-12 pl-10">
    {items.map((card, i) => (
      <FadeIn key={card.title} delay={i * 0.1}>
        <div className="relative">
          <PineConeIcon className="absolute -left-[52px] top-0 w-6 h-8 text-[var(--color-forest)]" />
          <h3 className="font-serif-display font-bold text-2xl mb-2 text-[var(--color-text)]">{card.title}</h3>
          <p className="max-w-xl leading-relaxed text-[var(--color-text-muted)]">{card.desc}</p>
        </div>
      </FadeIn>
    ))}
  </div>
)}
```

시위 사진 블록은 `photo-frame paper-tilt-r`로 감싸고 credit을 `font-hand text-lg text-[var(--color-text-muted)] mt-2 text-right pr-1`로.

- [ ] **Step 2: 검증 + Commit**

```bash
git add -A && git commit -m "홈 희망 섹션을 오솔길 발자취로 — 점선 이정표·앨범 프레임 시위 사진"
```

### Task 8: HomeQuotesSection — 편지지 위 증언

**Files:**
- Modify: `website/src/components/home/HomeQuotesSection.tsx`

**Interfaces:**
- Consumes: `paper`, `paper-tilt-l`/`paper-tilt-r`, `font-serif-display`, `font-hand`
- contentKey `home.quotes.heading`/`subtitle`/`items` 유지
- 주의: Task 4에서 섹션 배경이 네이비→한지로 바뀌었으므로 **내부의 흰 잉크 클래스(`text-white/75`, `text-white/20`, `text-white/70`)를 전부 잉크 토큰으로 교체**해야 한다. 남기면 크림 배경 위 흰 글자가 되어 안 보인다.

- [ ] **Step 1: 재작성**

헤딩 블록 좌정렬 + 잉크 토큰(`text-[var(--color-text)]` / subtitle `text-[var(--color-text-muted)]`). 인용 렌더러:

```tsx
{(items) => (
  <div className="space-y-10 md:space-y-12">
    {items.map((item, i) => (
      <FadeIn key={item.name} delay={i * 0.15}>
        <blockquote className={`paper ${i % 2 === 0 ? "paper-tilt-l" : "paper-tilt-r"} p-8 md:p-10`}>
          <div className="relative z-[1]">
            <span className="font-serif-display text-6xl leading-none text-[var(--color-forest)]/25 select-none" aria-hidden="true">
              {"“"}
            </span>
            <p className="font-serif-display text-xl sm:text-2xl md:text-[1.7rem] leading-relaxed text-[var(--color-text)] mt-2 mb-5">
              {item.quote}
            </p>
            <footer className="font-hand text-2xl text-[var(--color-text-muted)] text-right">
              — {item.name}
            </footer>
          </div>
        </blockquote>
      </FadeIn>
    ))}
  </div>
)}
```

- [ ] **Step 2: 검증 + Commit**

스크린샷에서 흰 글자 잔존이 없는지 반드시 확인.

```bash
git add -A && git commit -m "홈 증언 섹션 네이비 밴드 폐기 — 편지지 카드·손글씨 서명"
```

### Task 9: HomeCtaSection — 답장을 보내주세요

**Files:**
- Modify: `website/src/components/home/HomeCtaSection.tsx`
- Modify: `website/src/components/home/HomeInlineSignatureForm.tsx` (표면 클래스만)

**Interfaces:**
- Consumes: `paper`, `paper-field`, `stamp-badge`(+`stamp-badge__inner`), `PostmarkStamp`, `letter-btn letter-btn--primary`
- **허용된 콘텐츠 변경(spec §4-6, §8 근거)**: `home.cta.heading` defaultValue "함께해주세요" → "숲에 답장을 보내주세요". 그 외 문안·contentKey 전부 유지.
- 서명 제출 로직·GA4 이벤트·`onSignatureCountChange` 흐름 불변

- [ ] **Step 1: HomeCtaSection 헤딩·카운터 재작성**

헤딩 블록(센터 유지 — CTA는 의도적 센터):

```tsx
<FadeIn className="relative text-center mb-16 max-w-2xl mx-auto">
  <PostmarkStamp className="absolute -top-6 right-0 w-20 h-20 text-[var(--color-forest)]/35 rotate-12 hidden sm:block" />
  <EditableText … contentKey="home.cta.heading" defaultValue="숲에 답장을 보내주세요"
    className="font-serif-display font-bold text-3xl sm:text-4xl md:text-5xl mb-4 text-[var(--color-text)]" />
  <EditableText … contentKey="home.cta.subtitle"
    className="text-balance text-lg text-[var(--color-text-muted)]" />
</FadeIn>
```

카운터 블록은 우표 뱃지 안으로:

```tsx
{signatureCount !== null && (
  <FadeIn className="mb-12 flex justify-center">
    <div className="stamp-badge inline-block">
      <div className="stamp-badge__inner">
        <EditableText … contentKey="home.cta.countPrefix" className="text-sm text-[var(--color-text-muted)]" />
        <p className="font-serif-display font-bold text-4xl sm:text-5xl text-[var(--color-warm)] my-1">
          <AnimatedCounter target={signatureCount} suffix="명" />
        </p>
        <EditableText … contentKey="home.cta.countSuffix" className="text-sm text-[var(--color-text-muted)]" />
      </div>
    </div>
  </FadeIn>
)}
```

3개 액션 카드는 `bg-white rounded-[var(--radius-card)] … shadow-card` → `paper`(내용은 `relative z-[1]` 래퍼 추가), 버튼 2종의 `rounded-full bg-[var(--color-warm)] …` 클래스 문자열을 `letter-btn letter-btn--primary`로.

- [ ] **Step 2: HomeInlineSignatureForm 표면 치환**

파일을 읽고 치환표대로: `frost`→`paper`, `frost-field`→`paper-field`, `glass-btn glass-btn--primary`→`letter-btn letter-btn--primary`, 흰 잉크 텍스트가 있으면 잉크 토큰으로. 폼 필드 name·검증·submit 핸들러·analytics 호출은 한 줄도 바꾸지 않는다.

- [ ] **Step 3: 검증 + Commit**

서명 폼 동작 확인: dev 서버에서 폼에 이름/이메일 입력 → 제출 → (Supabase 미연결 로컬이면 에러 응답이라도) 폼 검증·버튼 상태가 기존과 동일하게 반응하는지. 스크린샷으로 우표·소인·편지지 확인.

```bash
git add -A && git commit -m "홈 CTA를 '숲에 답장' 컨셉으로 — 우표 카운터·소인 장식·편지지 폼 표면"
```

### Task 10: HomeStatsSection + 홈 전체 시각 검증

**Files:**
- Modify: `website/src/components/home/HomeStatsSection.tsx`

**Interfaces:**
- Consumes: `font-serif-display`, Task 4의 stats 배경(`bg-[var(--color-deep)]`)
- contentKey `home.stats.items` 유지

- [ ] **Step 1: 숫자 타이포 교체**

숫자를 세리프로, 라벨 잉크를 한지 톤으로:

```tsx
<div className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-earth-light)] mb-2">
  {stat.number}
</div>
<div className="text-sm sm:text-base text-[#FFFDF7]/60">{stat.label}</div>
```

- [ ] **Step 2: 홈 전체 검증 (Phase 2 마감 게이트)**

```bash
npm run lint && npm run build
```

chrome-devtools에서 reveal 무효화 initScript(Task 4 Step 4 참조)를 걸고 홈 풀페이지 스크린샷 — 데스크톱(1440×900)·모바일(390×844) 각 1장. 체크리스트:

1. 배경이 히어로 사진→한지→이끼(cta)→깊은 숲(stats)로만 흐르는가 (네이비·검정·베이지 패치워크 소멸)
2. 글래스 잔존 요소가 홈에 0개인가 (`grep -rn "glass\|frost" src/components/home --include="*.tsx"` → 0줄)
3. 제목이 전부 MaruBuri인가, 손글씨는 서명·캡션·여는말 3곳뿐인가
4. 감빛은 히어로 CTA·카운터 숫자·서명 버튼에만 있는가

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "홈 통계 밴드를 깊은 숲 그린·세리프 숫자로 — 홈 리디자인(Phase 2) 마감"
```

---

## Phase 3 — 공통 컴포넌트

### Task 11: Navigation — 유리 캡슐에서 종이 바로

**Files:**
- Modify: `website/src/components/Navigation.tsx`
- Modify: `website/src/components/navigation/DesktopNavigation.tsx`, `MobileNavigationButton.tsx`, `MobileNavigationMenu.tsx`, `NavigationAuthLinks.tsx`, `NavigationLogo.tsx` (잉크 색만)
- 확인만: `useNavigationChrome.ts` (`visible`/`isTransparent` 로직은 그대로 쓴다)

**Interfaces:**
- Consumes: `paper-sheet`, `ink-chip`
- Produces: 상단 풀폭 종이 바. `isTransparent`(히어로 사진 위) = 투명 배경 + 흰 잉크, 스크롤 후 = 한지 배경 + 하단 보더 + 잉크 텍스트. 메뉴 항목·링크·접근성 속성 불변.

- [ ] **Step 1: Navigation.tsx의 셸 교체**

`material` 변수와 캡슐(`rounded-full max-w-6xl`) 구조를 제거하고 풀폭 바로:

```tsx
const chrome = isTransparent
  ? "bg-transparent text-white"
  : "paper-sheet border-b border-[var(--color-border)] shadow-[0_2px_12px_rgb(34_48_31/0.06)]";

return (
  <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav
        aria-label="주요 내비게이션"
        className={`${chrome} px-4 sm:px-6 py-3 transition-colors duration-300`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          {/* 내부 구조(NavigationLogo / DesktopNavigation / NavigationAuthLinks / MobileNavigationButton)는 기존 그대로 */}
        </div>
      </nav>
    </header>
    {/* MobileNavigationMenu 렌더링 기존 그대로 */}
  </>
);
```

- [ ] **Step 2: 하위 컴포넌트 잉크 정리**

5개 하위 파일을 각각 읽고: (a) `isTransparent` 분기에서 투명일 때 흰 잉크, 아닐 때 `text-[var(--color-text)]` 계열인지 확인·수정, (b) 치환표 적용(`frost-sheet`→`paper-sheet`, glass 칩→`ink-chip`, 활성 메뉴 하이라이트가 유리 배경이면 `bg-[var(--color-bg-moss)]` + 잉크로). 링크 href·aria 속성·포커스 트랩 로직은 불변.

- [ ] **Step 3: 검증 + Commit**

홈(투명 상태)과 /story(스크롤 후 상태) 각각 스크린샷. 모바일 메뉴 열림 상태도 1장 — 뒤 페이지가 확실히 가려지는지(불투명 한지) 확인.

```bash
npm run lint && npm run build
git add -A && git commit -m "내비게이션 유리 캡슐 폐기 — 풀폭 종이 바·불투명 한지 모바일 시트"
```

### Task 12: SubHero — 전 서브페이지 히어로 일괄 전환

**Files:**
- Modify: `website/src/components/SubHero.tsx` (전면 재작성)

**Interfaces:**
- Consumes: `ink-chip`, `RidgeDivider`, `font-serif-display`
- Produces: props 시그니처 **완전 동일**(`imageUrl`/`fallbackImageUrl`/`imageContentKey`/`imagePage`/`imageSection`/`imageAlt`/`title`/`subtitle`/`eyebrow`/`metric`/`variant`) — 호출부 수정 없이 전 서브페이지가 수혜.

- [ ] **Step 1: 재작성**

이미지 로딩·폴백·EditableImage 분기 로직(기존 24–56행, 62–88행)은 그대로 유지하고, 오버레이·패널 부분만 교체한다:

```tsx
{/* 기존 radial+linear 3중 그라디언트와 blur 원 장식을 삭제하고: */}
<div
  className="absolute inset-0"
  style={{
    background:
      "linear-gradient(180deg, rgba(12,20,12,0.62) 0%, rgba(12,20,12,0.38) 55%, rgba(12,20,12,0.25) 100%)",
  }}
  aria-hidden="true"
/>
<RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />

<div className="relative z-[3] mx-auto max-w-3xl">
  {hasEyebrow && (
    <span className="ink-chip mb-5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap uppercase tracking-[0.12em]">
      {eyebrow}
    </span>
  )}
  <h1 className="font-serif-display mb-4 text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">
    {title}
  </h1>
  {subtitle && (
    <p className="mx-auto max-w-xl text-base leading-relaxed text-white/88 md:text-lg [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
      {subtitle}
    </p>
  )}
  {metric && <div className="mt-8 md:mt-10">{metric}</div>}
</div>
```

`section`의 className에서 `text-center`는 유지, 하단 패딩은 능선 높이를 감안해 `pb-24 md:pb-32`(standard) / `pb-28 md:pb-36`(emphasis)으로.

- [ ] **Step 2: 검증 + Commit**

/story, /timeline, /petition, /gallery 4곳 스크린샷 — 유리 패널이 전부 사라지고 능선 경계가 보이는지.

```bash
npm run lint && npm run build
git add -A && git commit -m "SubHero 유리 패널 제거 — 사진 직접 타이포·능선 경계, 전 서브페이지 일괄 적용"
```

### Task 13: Footer — 능선 위의 깊은 숲

**Files:**
- Modify: `website/src/components/Footer.tsx`
- 필요시 Modify: `website/src/components/footer/FooterBrand.tsx`, `FooterQuickLinks.tsx`, `FooterContact.tsx`, `FooterBottomBar.tsx`, `FooterPrivacyPanel.tsx` (잉크 대비만)

**Interfaces:**
- Consumes: `RidgeDivider`
- Produces: 푸터 배경 `bg-[var(--color-deep)]`, 상단에 능선 경계. 링크·연락처·개인정보 패널 로직 불변.

- [ ] **Step 1: Footer.tsx 교체**

```tsx
return (
  <footer role="contentinfo">
    {/* 배경은 투명 — 앞 섹션 배경이 비쳐야 한다 */}
    <RidgeDivider className="text-[var(--color-deep)] -mb-px" />
    <div className="bg-[var(--color-deep)] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* 기존 grid + FooterBottomBar + FooterPrivacyPanel 그대로 */}
      </div>
    </div>
  </footer>
);
```

**능선에 배경색을 넣지 말 것.** 투명이어야 한지 페이지에서는 크림 위에 능선이 찍히고, 홈(위가 deep인 stats 섹션)에서는 deep 위 deep이라 자연히 사라진다. `bg-[var(--color-bg)]`를 넣으면 홈에서 stats와 푸터 사이에 크림색 띠가 생긴다.

- [ ] **Step 2: 하위 푸터 컴포넌트 잉크 확인**

5개 파일을 읽고 `--color-forest` 배경을 전제로 한 저대비 잉크(`text-white/50` 미만)가 있으면 `/70` 이상으로 올린다. FooterPrivacyPanel이 유리 클래스를 쓰면 치환표 적용.

- [ ] **Step 3: 검증 + Commit**

```bash
npm run lint && npm run build
git add -A && git commit -m "푸터를 깊은 숲 그린·능선 경계로 — 전 페이지 하단 마감 통일"
```

---

## Phase 4 — 서브페이지 순차 적용

각 태스크 공통 절차: (1) 명시된 파일을 전부 읽는다 (2) 치환표를 적용한다 (3) 페이지 지시를 적용한다 (4) `npm run lint && npm run build` (5) 해당 페이지 데스크톱·모바일 스크린샷 (6) 커밋. 이하 태스크별로 파일 목록·페이지 지시·커밋 메시지만 적는다.

### Task 14: /story — 수필 레이아웃

**Files:** `website/src/app/story/page.tsx`, `website/src/components/story/StoryReasonsSection.tsx`, `StoryBattleSection.tsx`, `StoryDemandsSection.tsx`, `StoryTransportSection.tsx` (영문판 `EnglishStory*`는 Task 20)

**페이지 지시:**
- 본문 단락 폭 `max-w-2xl`, `leading-loose`, 섹션 제목 `font-serif-display font-bold` 좌정렬
- "왜 반대하는가" 카드 그리드 → 종이 카드 + 번호 패턴:

```tsx
<div className="paper h-full p-8">
  <div className="relative z-[1]">
    <span aria-hidden="true" className="font-serif-display text-sm font-bold tracking-[0.25em] text-[var(--color-forest)]">
      {String(i + 1).padStart(2, "0")}
    </span>
    <h3 className="font-serif-display font-bold text-2xl mt-3 mb-4 text-[var(--color-text)]">{card.title}</h3>
    <p className="leading-relaxed text-[var(--color-text)]/85">{card.desc}</p>
  </div>
</div>
```

- "주민들은 어떻게 싸워왔나" 연혁 리스트 → 오솔길 이정표 패턴:

```tsx
<div className="trail-line relative ml-2 space-y-12 pl-10">
  {/* 각 항목: */}
  <div className="relative">
    <PineConeIcon className="absolute -left-[52px] top-0 w-6 h-8 text-[var(--color-forest)]" />
    <h3 className="font-serif-display font-bold text-2xl mb-2 text-[var(--color-text)]">{제목}</h3>
    <p className="max-w-xl leading-relaxed text-[var(--color-text-muted)]">{설명}</p>
  </div>
</div>
```
- 본문 사진 → `photo-frame`(교대로 `paper-tilt-l`/`paper-tilt-r`), 캡션 `font-hand text-lg`
- 인용 블록("우리는 우리의 숲…") → `font-serif-display` 대형 + `font-hand` 서명
- 영상·지도 embed는 `paper` 카드로 감싸기만 하고 iframe 속성 불변

**Commit:** `git add -A && git commit -m "/story 수필 레이아웃 전환 — 세리프 제목·오솔길 연혁·앨범 사진 프레임"`

### Task 15: /timeline — 발자취 오솔길

**Files:** `website/src/components/timeline/TimelinePage.tsx`, `TimelineCard.tsx`, `TimelineYearFilter.tsx`, `TimelineCta.tsx`, `timeline-config.ts`(스타일 상수가 있으면)

**페이지 지시:**
- 중앙 세로선 → `trail-line`(3px 점선, forest 40%), 노드 점 → `PineConeIcon` 소형
- 카드 → `paper` + 카드 내 연도/시기 뱃지는 `ink-chip`이 아닌 잉크 텍스트 칩(`bg-[var(--color-bg-moss)] text-[var(--color-forest)] rounded-full px-3 py-1 text-sm font-bold`)
- 연도 필터 pill: 활성 = `bg-[var(--color-forest)] text-white`, 비활성 = `bg-white border border-[var(--color-border)] text-[var(--color-text-muted)]` (감빛 사용 금지 — 서명 전용 규칙)
- 인용 밴드("단 하루도 쉬지 않았습니다") → `font-serif-display` + 한지 배경
- TimelineCta의 버튼 → `letter-btn letter-btn--primary`(서명 유도이므로 감빛 허용)

**Commit:** `git add -A && git commit -m "/timeline 오솔길 점선·종이 카드로 전환 + 연도 필터 잉크 정리"`

### Task 16: /petition — 답장 컨셉 전면화

**Files:** `website/src/app/petition/page.tsx`, `website/src/components/petition/PetitionSignatureForm.tsx`, `PetitionFormFields.tsx`, `PetitionConsentFields.tsx`, `PetitionActionCards.tsx`, `RecentSignatures.tsx`, `PetitionSuccess.tsx`, `PetitionAnimatedCounter.tsx`, `signature-form/` 내 표면 컴포넌트

**페이지 지시:**
- 폼 카드 → `paper p-8 md:p-12`(편지지), 필드 → `paper-field`, 제출 버튼 → `letter-btn letter-btn--primary`
- 카운터 블록: **/petition의 서명 수는 이미 SubHero의 `metric` prop으로 히어로에 렌더되고 있다. 새 카운터를 추가하지 말고 그 기존 카운터에 우표 뱃지를 입힌다**(중복 카운터 금지). 사진 위 잡음을 피해 `PostmarkStamp` 장식은 히어로에 넣지 않는다 — 필요하면 폼 카드 주변에 1개까지.

```tsx
{/* /petition의 metric prop에 넘기는 기존 카운터를 이 껍데기로 감싼다 */}
<div className="stamp-badge inline-block">
  <div className="stamp-badge__inner">
    <p className="text-sm text-[var(--color-text-muted)]">{기존 프리픽스 문안 그대로}</p>
    <p className="font-serif-display font-bold text-4xl sm:text-5xl text-[var(--color-warm)] my-1">
      {/* 기존 PetitionAnimatedCounter 그대로 */}
    </p>
    <p className="text-sm text-[var(--color-text-muted)]">{기존 서픽스 문안 그대로}</p>
  </div>
</div>
```
- RecentSignatures 카드 → `paper` + 교대 tilt, 서명 메시지는 본문체 유지(신뢰 요소 — 손글씨 금지), 날짜만 `text-[var(--color-text-muted)]`
- 액션 카드 3종 → Task 9의 카드 패턴과 동일(`paper` + `letter-btn`)
- **검증·중복 방지·rate limit·GA4(`signatureStart`/`signatureComplete`)·PetitionSuccess/Confetti 로직은 한 줄도 변경 금지.** 제출 플로우를 dev에서 1회 통과 확인(로컬 Supabase 미연결이면 에러 UI까지가 기존과 동일한지 확인)

**Commit:** `git add -A && git commit -m "/petition 답장 편지지 전면화 — 우표 카운터·종이 폼, 서명 로직 불변"`

### Task 17: /gallery — 사진 앨범

**Files:** `website/src/app/gallery/page.tsx` + `website/src/components/gallery/` 전체

**페이지 지시:**
- 그리드 아이템 → `photo-frame` + 인덱스 기반 교대 tilt(`i % 3 === 0 ? "paper-tilt-l" : i % 3 === 2 ? "paper-tilt-r" : ""` — 전부 기울이면 유치해진다, 1/3만)
- 캡션·날짜 → `font-hand text-lg text-[var(--color-text-muted)]`
- 라이트박스/모달이 있으면 배경 오버레이만 `rgba(30,51,23,0.9)`로, 동작 불변

**Commit:** `git add -A && git commit -m "/gallery 앨범 프레임 그리드 — 교대 기울임·손글씨 캡션"`

### Task 18: /press·/news — 신문 스크랩

**Files:** `website/src/app/press/page.tsx`, `website/src/app/news/` 전체, `website/src/components/news-list/`, `website/src/components/press/` 전체

**페이지 지시:**
- 기사 카드 → `paper` + 상단 1px rule(`border-t-2 border-[var(--color-text)]` — 신문 헤드 은유는 이 한 줄로 절제), 날짜·매체명 `font-serif-display text-sm`
- 목록 페이지의 카테고리/연도 필터 pill: 활성 = `bg-[var(--color-forest)] text-white`, 비활성 = `bg-white border border-[var(--color-border)] text-[var(--color-text-muted)]` (감빛 금지 — 서명 전용 규칙)
- 외부 기사 링크·이미지 미러링 URL 불변

**Commit:** `git add -A && git commit -m "/press·/news 종이 카드·신문 rule 절제 적용"`

### Task 19: concert·donate·board·share·인증 — 치환표 일괄

**Files:** `website/src/app/concert/ConcertHero.tsx` 및 `concert/` 전체, `website/src/app/donate/` + `website/src/components/donate/`, `website/src/app/board/` + `website/src/components/board/`, `website/src/app/share/`, `website/src/app/login/page.tsx`, `website/src/app/signup/page.tsx`, `website/src/app/mypage/`, `website/src/components/auth/AuthShell.tsx`, `website/src/components/card-news/`, `website/src/components/ShareButtons.tsx`, `website/src/components/CardNews.tsx`

**페이지 지시:**
- 전부 치환표 기계 적용이 기본. ConcertHero는 유리 패널을 제거하고 사진 위 직접 타이포로 — 오버레이는 `linear-gradient(180deg, rgba(12,20,12,0.62) 0%, rgba(12,20,12,0.38) 55%, rgba(12,20,12,0.25) 100%)`, 하단에 `<RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />`, 제목은 `font-serif-display font-bold text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]`
- AuthShell: `frost` 카드 → `paper p-8`, 필드 → `paper-field`, 제출 → `letter-btn letter-btn--primary`(로그인/가입도 행동 유도 버튼이므로 허용)
- donate 계좌·후원 안내 카드 → `paper`, 후원 버튼 감빛 유지
- board 글 목록·글쓰기 폼 → `paper`/`paper-field`, 기능 로직 불변
- 각 페이지 200 응답 + 스크린샷 확인: `/concert`, `/donate`, `/board`, `/share`, `/login`, `/signup`

**Commit:** `git add -A && git commit -m "concert·donate·board·share·인증 페이지 종이 재질 일괄 전환"`

### Task 20: /en 전체 — 영문판 동기화

**Files:** `website/src/app/en/` 전체, `website/src/components/story/EnglishStoryBattleSection.tsx`, `EnglishStoryDemandsSection.tsx`, `EnglishStoryReasonsSection.tsx`, `EnglishStoryTransportSection.tsx`

**페이지 지시:**
- 한글판에서 확정된 패턴을 그대로 이식한다: 각 영문 페이지의 한글 대응 페이지 커밋 diff를 참고해 동일 클래스로
- MaruBuri는 라틴 글리프를 포함하므로 `font-serif-display` 그대로 사용. `font-hand`(나눔 펜)는 라틴 지원이 빈약하므로 **영문판에서는 손글씨 대신 `font-serif-display italic`**을 쓴다
- `/en`, `/en/story`, `/en/press`, `/en/gallery`, `/en/donate` 200 + 스크린샷

**Commit:** `git add -A && git commit -m "/en 영문판에 숲의 편지 시스템 동기화 — 손글씨는 세리프 이탤릭 대체"`

---

## Phase 5 — 마감

### Task 21: 글래스 시스템 제거 + 전 페이지 최종 검증

**Files:**
- Modify: `website/src/app/globals.css` (리퀴드 글래스 토큰·클래스·폴백 블록 삭제)

- [ ] **Step 1: 잔여 참조 0 확인 (삭제 전 게이트)**

```bash
cd website
grep -rn "glass\|frost" src --include="*.tsx" | grep -v paper
```

0줄이어야 한다. 나오면 해당 파일을 치환표로 마저 이주하고 다시 확인한다. **0줄이 되기 전에 Step 2로 넘어가지 않는다.**

- [ ] **Step 2: globals.css에서 글래스 삭제**

다음을 삭제한다: `@theme` 내 `--glass-*`/`--frost-*` 토큰 전부, "리퀴드 글래스 재질" 주석 블록부터 `.glass`/`.glass-strong`/`.glass-subtle`/`.frost`/`.frost-sheet`/`.frost-field`/`.glass-dark`/`.glass-btn` 계열/`.glass-chip` 정의 전부, "폴백 1"/"폴백 2" `@supports`·`@media (prefers-reduced-transparency)` 블록 중 글래스 대상 규칙. 이때 `prefers-reduced-transparency` 대응이 필요한 신규 클래스는 없는지 확인한다(종이 재질은 불투명이라 원래 불필요 — 그 사실을 주석 한 줄로 남긴다).

```bash
grep -n "glass\|frost" src/app/globals.css   # → 0줄
```

- [ ] **Step 3: 전 페이지 최종 검증**

```bash
npm run lint && npm run build
PORT=3001 npm run dev &
sleep 6
for p in / /story /timeline /petition /gallery /press /news /concert /donate /board /share /login /signup /en /en/story /en/press /en/gallery /en/donate; do
  printf "%s:%s " "$p" "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3001$p")"
done; echo
```

전부 200(인증 필요 페이지는 3xx 허용). chrome-devtools로 홈·story·timeline·petition·gallery 5페이지 × 데스크톱·모바일 풀페이지 스크린샷(reveal 무효화 initScript 사용). 체크리스트:

1. 유리 흔적 0, 배경 패치워크 0
2. 감빛 사용처가 서명·후원·CTA 버튼과 카운터뿐인가
3. 손글씨 사용처가 서명·캡션·여는말뿐인가 (영문판은 0)
4. 모바일에서 tilt 카드가 뷰포트 밖으로 삐져나가 가로 스크롤을 만들지 않는가 (`document.body.scrollWidth <= window.innerWidth` 확인)
5. `prefers-reduced-motion` 에뮬레이션에서 tilt·애니메이션이 꺼지는가

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "리퀴드 글래스 시스템 완전 제거 — 숲의 편지 리디자인 마감, 전 페이지 검증"
```
