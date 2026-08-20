# CSS `@layer components` 리팩토링 보고서

브랜치: `refactor/css-layer` · 대상: `website/src/app/globals.css` + 6개 컴포넌트

## 문제

Tailwind v4에서는 레이어가 없는 CSS가 레이어된(유틸리티) CSS를 specificity·소스 순서와
무관하게 항상 이긴다. `globals.css`의 "종이 재질 시스템"(`.paper`, `.letter-btn`,
`.ink-chip` 등)은 레이어 밖에 선언돼 있었고, 그 결과 리디자인 중 Tailwind 유틸리티가
조용히 6번 무력화됐다(버튼 크기, disabled 커서, 칩 padding·font-weight 등). 매번
Tailwind의 트레일링 `!` 수식자로 임시 봉합했다.

## 변경 내용

### `@layer components`로 옮긴 것

"종이 재질 시스템" 블록 전체를 `@layer components`로 감쌌다:
`.paper`, `.paper::after`, `.paper-tilt-l`/`.paper-tilt-r`, `.paper-field`(및
`::placeholder`), `.paper-sheet`, `.photo-frame`(및 `> img`), `.ink-chip`,
`.letter-btn`과 그 변형(`--primary`, `--outline`)·`:active`/`:hover` 상태,
`.stamp-badge`/`.stamp-badge__inner`, `.trail-line`.

새 레이어 블록 위에 왜 필요한지 설명하는 한글 주석을 추가했다.

### 레이어 밖에 의도적으로 남긴 것

- 애니메이션/동작 클래스: `.animate-count`, `.rise-in`(및 delay 변형), `.reveal`/
  `.reveal.is-visible`, `.toast-in`, `.fade-in`, `.pop-in`, `.chevron-bounce`,
  `.hover-lift`. 이들은 `opacity`/`transform`/`animation`을 설정하며, `.reveal`의
  `opacity: 0` 시작값처럼 우연한 유틸리티에 절대 지면 안 되는 규칙들이라 그대로 둔다.
- `:focus-visible`, 스크롤바 규칙, `prefers-reduced-motion` 블록들, `body`, `html`,
  제목/본문 타이포그래피 규칙.
- `@theme inline`과 `:root` 커스텀 프로퍼티 — CSS 규칙이 아니므로 이동 대상이 아니다.
- `.paper-tilt-l`/`.paper-tilt-r`를 무력화하는 `prefers-reduced-motion` 블록은
  레이어 밖에 그대로 남겼다(아래 "감속 모션 서브틀티" 참고).

### `!` 워크어라운드 제거 (6곳 중 5곳 수정, 1곳은 요구사항대로 삭제 방식)

| 파일 | 변경 |
|---|---|
| `src/components/home/HomeConcertBanner.tsx:16` | `gap-x-2 gap-y-1 font-semibold` 3개 유틸리티 삭제(죽어 있던 유틸리티라 레이어링하면 되살아나 칩이 바뀌므로, `.ink-chip` 자체 값(`gap:6px`, `font-weight:700`)만 남김) |
| `src/components/home/HomeHeroSection.tsx:101` | `text-base! sm:text-lg!` → `text-base sm:text-lg` |
| `src/components/home/inline-signature/HomeInlineSignatureFields.tsx:49` | `min-h-[48px]! disabled:cursor-not-allowed!` → `min-h-[48px] disabled:cursor-not-allowed` |
| `src/components/petition/PetitionSignatureForm.tsx:74` | `disabled:cursor-not-allowed!` → `disabled:cursor-not-allowed` |
| `src/components/news-list/NewsCard.tsx:16` | `border-t-2! border-t-[var(--color-text)]!` → `border-t-2 border-t-[var(--color-text)]` |
| `src/app/board/[id]/CommentSection.tsx:195`, `src/components/board/BoardPostForm.tsx:95` | `paper-field w-full` 그대로 둠(둘 다 `width:100%`라 완전한 no-op) |

## 감속 모션(reduced-motion) 서브틀티 — 확인 결과

`.paper-tilt-l`/`.paper-tilt-r`를 무력화하는 `@media (prefers-reduced-motion: reduce)`
블록은 여전히 레이어 밖에 있고, 타일트 클래스 자체는 이제 `@layer components` 안에
있다. **레이어 없는 규칙은 레이어된 규칙을 항상 이기므로**, reduced-motion 환경에서는
이 블록의 `transform: none`이 레이어된 `.paper-tilt-l { transform: rotate(-1.1deg) }`를
그대로 덮어쓴다 — 의도한 동작 그대로 유지된다. 실제 CSS 캐스케이드 규칙으로 확인했으며
(레이어 우선순위는 "unlayered > layered" 순이고 동일 unlayered 규칙끼리는 소스 순서가
적용되지만, 여기서는 애초에 layered vs unlayered 비교이므로 순서 무관하게 unlayered인
reduced-motion 블록이 이긴다), 별도 브라우저 스모크 테스트는 하지 않았다(코드 검토로
충분히 확정적).

## Before/After computed-style 비교

개발 서버(`PORT=3001 npm run dev`, chrome-devtools MCP)로 측정. 참고: 세션 시작 시
포트 3001에 떠 있던 기존 dev 서버(전날 16:12 시작)의 Turbopack 캐시가 손상돼
"종이 재질 시스템" CSS 전체(`.paper`, `.letter-btn`, `.ink-chip` 등)가 번들에서
누락돼 있었다. `.next` 삭제 후 재시작해 정상 상태로 되돌린 뒤 before 측정을 다시
했다 — 이 이슈는 이번 리팩토링과 무관한 사전 존재 캐시 문제였다.

| 항목 | Before | After | 일치 |
|---|---|---|---|
| 히어로 버튼 font-size (desktop 1440px, `sm:text-lg`) | 18px | 18px | ✅ |
| 히어로 버튼 font-size (mobile 390px, `text-base`) | 16px | 16px | ✅ |
| 히어로 버튼 cursor / display | pointer / flex | pointer / flex | ✅ |
| 인라인 서명 제출 버튼 min-height | 48px | 48px | ✅ |
| 인라인 서명 제출 버튼 cursor(활성) | pointer | pointer | ✅ |
| 인라인 서명 제출 버튼 cursor(disabled) | not-allowed | not-allowed | ✅ |
| 청원 제출 버튼 cursor(활성) | pointer | pointer | ✅ |
| 청원 제출 버튼 cursor(disabled) | not-allowed | not-allowed | ✅ |
| 뉴스 카드 border-top-width | 2px | 2px | ✅ |
| 뉴스 카드 border-top-color | rgb(34,48,31) | rgb(34,48,31) | ✅ |
| 뉴스 카드 border-left/right/bottom-width | 1px/1px/1px | 1px/1px/1px | ✅ |
| 콘서트 배너 칩 gap / font-weight | 6px / 700 | 6px / 700 | ✅ |
| `paper-field w-full` 너비(400px 컨테이너 기준 합성 테스트) | 400px | 400px | ✅ |

콘서트 배너 칩: 오늘 날짜(2026-08-20) 기준 8월 1일 공연이 이미 지나
`isConcertOver()`가 `true`를 반환해 `HomeConcertBanner`는 실제로 `null`을 렌더링한다
(라이브 페이지에는 칩이 보이지 않음). 위 gap/font-weight 값은 실제 클래스 목록을 가진
합성(synthetic) `<a>` 엘리먼트를 페이지 컨텍스트에 주입해 측정한 값이며, before는
"유틸리티 3개 포함 + 언레이어드"(죽어있는 유틸리티, `.ink-chip` 자체 값이 이김),
after는 "유틸리티 3개 삭제 + 레이어드"(더 이상 충돌 자체가 없음) 상태를 각각
반영한다. 두 값이 정확히 일치해 chip이 다시 렌더링될 때도(공연 시즌) 동일하게
보일 것으로 확인했다.

## 스크린샷 비교 (desktop 1440×900, full page)

`/`, `/petition`, `/news`, `/board`를 변경 전/후로 캡처해 ImageMagick `compare`로
픽셀 diff를 뜸.

| 페이지 | 다른 픽셀 수 | 판정 |
|---|---|---|
| `/` (home) | 0 | 완전 동일 |
| `/board` | 0 | 완전 동일 |
| `/petition` | 118,448 (2.53%) | "최근 서명" 목록의 실데이터가 두 캡처 사이에 바뀐 것 — CSS 무관. diff 하이라이트로 변경 영역이 서명 리스트 텍스트뿐임을 육안 확인 |
| `/news` | 2,156 (0.05%) | 헤더 햄버거 아이콘 부근의 미세한 서브픽셀 차이(안티에일리어싱/JPEG 인코딩 노이즈로 추정) — 레이아웃·테두리·간격 변화 없음 |

레이아웃, 버튼 모양, 카드 테두리, 간격 등 시각적으로 확인 가능한 모든 요소가
변경 전/후 동일하다.

## Lint / Build

```
npm run lint   → 통과(경고·에러 없음)
npm run build  → 성공. "Supabase is not configured in production for published news"
                 경고는 로컬 빌드에 프로덕션 Supabase 환경변수가 없어 발생하는
                 프로젝트의 fail-closed 정책에 따른 기대된 경고이며, 이번 변경과 무관.
```

## 가드 스위트 (`*:check`)

44개 스크립트 중 **42개 통과, 2개 실패**:

- `home-page:refactor:check` — 실패 (`Home page must compose HomeAboutSection.`)
- `timeline-client:refactor:check` — 실패 (`TimelineCard.tsx must contain useInView.`)

두 실패 모두 `main`에서도 동일하게 실패하는 사전 존재 이슈이며, 이번 CSS 레이어
변경과 무관하다.

## `!` 워크어라운드 제거 확인

```
grep -rn '!"' src --include="*.tsx" | grep -E "letter-btn|paper|ink-chip"
```

결과 없음(exit 1) — 지정된 6곳에서 `!` 트레일링 수식자가 모두 제거됐다. 남은 곳 없음.

## 불확실한 점

- reduced-motion 서브틀티는 CSS 캐스케이드 규칙으로 확정했으나, 실제
  `prefers-reduced-motion: reduce`를 에뮬레이트한 브라우저 스크린샷 검증은 하지
  않았다. 규칙 자체가 명확해 낮은 리스크로 판단했다.
- 콘서트 배너 칩은 라이브 렌더링이 불가능한 상태(공연 종료)라 합성 엘리먼트로만
  검증했다. 로직상 문제는 없으나 공연 시즌 중 실제 렌더링 스모크 테스트는 하지
  못했다.
- 검증에 사용한 스크린샷은 `/Users/hwang-gyeongha/pine-nut/.css-layer-screenshots/`에
  임시로 저장했다가 검증 종료 후 삭제했다(git 미추적 디렉터리).

---

## 2차 리뷰 대응 (7번째 충돌 지점)

1차 리뷰에서 지적된 대로, 최초 조사에서 열거한 "6곳"은 실제로는 바닥값이었지
전체 목록이 아니었다. `SubHero.tsx`의 아이백로우 칩에서 7번째 충돌 지점이
발견됐다. 아래는 그 대응 내용이다.

### FIX 1 — `src/components/SubHero.tsx:102`: `.ink-chip` vs `tracking-[0.12em]`

`.ink-chip`은 자체적으로 `letter-spacing: 0.02em`을 선언한다. 리디자인 전
`.glass-dark` 칩은 letter-spacing을 아예 지정하지 않았고, `tracking-[0.12em]`
유틸리티가 그대로 적용돼 0.12em으로 렌더링됐다. Task 12에서 `.glass-dark`가
`.ink-chip`으로 교체되며 언레이어드 규칙이 유틸리티를 조용히 이겨 0.02em으로
바뀌었고, 아무도 `!`를 붙이지 않은 채 방치돼 있었다(다른 6곳과 달리 `!`가
없었던 이유가 바로 이것 — 무력화된 유틸리티라 애초에 아무도 문제로 인지하지
못했다). 레이어링 이후에는 `tracking-[0.12em]`이 다시 이기므로, 이는 회귀가
아니라 리디자인이 의도치 않게 죽였던 원래 트리트먼트(넓은 자간의 소형
대문자 아이백로우)를 복원하는 것이다. 따라서 **`tracking-[0.12em]`을 삭제하지
않고 그대로 이기게 두었다** — `SubHero.tsx`는 코드 변경 없음.

**letter-spacing (계산값), before/after**

| | before(리디자인 이후 ~ 레이어 이전) | after(레이어링 이후, 현재) |
|---|---|---|
| `.ink-chip`의 letter-spacing | `0.02em`(언레이어드 `.ink-chip`이 항상 이김 — 1차 패스에서 칩의 gap/font-weight로 이미 실증한 것과 동일한 캐스케이드 메커니즘) | `1.5px` = `0.12em`(폰트 크기 12.5px 기준; 라이브로 측정) |

before 값은 별도로 옛 커밋을 체크아웃해 재측정하지 않고, 1차 패스에서 이미
`.ink-chip`의 gap/font-weight로 실증한 것과 동일한 "언레이어드가 항상 이김"
캐스케이드 규칙에서 도출했다 — 동일 메커니즘이므로 재검증이 불필요하다고
판단했다. after 값은 아래 페이지들에서 실제 라이브 측정.

**페이지별 truncation 측정 (desktop 1440×900, mobile 390×844)**

`.ink-chip`은 `max-w-full overflow-hidden text-ellipsis whitespace-nowrap`이라
`scrollWidth > clientWidth`이면 말줄임(ellipsis)이 발생한다. 아래 3곳 모두
두 뷰포트에서 `scrollWidth === clientWidth`로 truncation 없음을 확인했다.

| 페이지 | 텍스트 | desktop scrollWidth/clientWidth | mobile scrollWidth/clientWidth | truncated |
|---|---|---|---|---|
| `/timeline` | "투쟁 연대기" | 92 / 92 | 92 / 92 | 아니오 |
| `/petition` | "참여하기" | 75 / 75 | 75 / 75 | 아니오 |
| `/en/petition` | "Petition" | 94 / 94 | 94 / 94 | 아니오 |

추가로 리스크가 가장 커 보였던 `/news/[slug]`(카테고리+날짜 조합이라 가장
긴 아이백로우 후보)도 확인했는데, 이 페이지는 `SubHero`가 아니라
`UtilityHeader`를 쓰고 `UtilityHeader`의 아이백로우는 `.ink-chip`이 아닌
자체 `<p>` + `tracking-[0.22em]`이라 이번 레이어링과 무관함을 확인했다(칩
자체가 없음 — `.ink-chip` 셀렉터로 찾아지지 않음).

세 페이지 모두 truncation 신규 발생 없음. 코드 변경 없이 안전하게 확인됨.

### FIX 2 — `src/components/builder/ManagedSection.tsx:10`: `THEME_CLASS_MAP.paper`

컴파일된 CSS를 확인한 결과 `!bg-white`(v3 리딩-`!` 문법)는 실제로
`.\!bg-white { background-color: var(--color-white) !important; }`로 컴파일돼
동작하고 있었다 — Tailwind v4가 레거시 호환으로 리딩-`!`도 인식해 클래스명
리터럴에 이스케이프된 `!`를 넣고 `!important`를 내보낸다. 즉 "적용되지 않던
죽은 클래스"는 아니었다.

다만 이 `!important`는 우리의 레이어 경계(`.paper` 등 재질 클래스)와는
무관했다 — `ManagedSection`을 실제로 쓰는 곳(`gallery`, `press`, `en`,
`story`, `HomeClient` 등)에서 `defaultClassName`이 이미 자체 `bg-[var(--color-*)]`
유틸리티를 갖고 있어, THEME_CLASS_MAP의 배경색은 **같은 유틸리티 레이어 안에서
서로 다른 Tailwind 유틸리티끼리** 경합하고 있었다. 이 경합은 className
속성값의 문자열 순서가 아니라 Tailwind가 생성한 스타일시트 내 규칙 순서로
결정되며(className 순서는 CSS 캐스케이드에 영향 없음), `!important` 없이도
`bg-white`가 실제 사용되는 모든 `defaultClassName` 배경 조합
(`bg-[var(--color-bg)]`, `bg-[var(--color-bg-warm)]`, `bg-[var(--color-forest)]`,
`bg-[var(--color-bg-moss)]`, `bg-[var(--color-deep)]`)을 합성 엘리먼트로
일일이 테스트해 전부 이긴다는 것을 확인했다(`bg-gradient-to-t` 변형은
`background-image`라 애초에 충돌하지 않음).

**판정: "작동하던 클래스였다"** — 삭제 후에도(`bg-white`, `!` 없이) 동일하게
이기므로 `!`를 제거했다. 다만 이 승리는 Tailwind의 유틸리티 생성 순서라는
구현 세부사항에 기대고 있어, 향후 `defaultClassName`에 새로운 종류의 배경
유틸리티가 추가되면 이론적으로 순서가 달라질 수 있다는 점은 참고용 메모로
남긴다(이번 변경으로 인한 결함은 아님).

### 가드 스위트 재실행

44개 스크립트 중 **42개 통과, 2개 실패**(`home-page:refactor:check`,
`timeline-client:refactor:check` — 동일하게 사전 존재, main에서도 실패).
`npm run lint`/`npm run build` 모두 재통과.

### "6곳" 인벤토리에 대한 결론

최초 스캔(원 디스패치 + 나의 1차 조사)이 찾아낸 6곳은 실제로는 **바닥값
(floor)이었지 상한(ceiling)이 아니었다** — 재질 클래스와 유틸리티가 같은
속성을 두고 겹치는 지점을 소스 전체에서 완전히 열거하는 정적 스캔은 어렵고,
`.ink-chip`의 letter-spacing처럼 "죽은 유틸리티라 아무도 `!`를 붙이지 않아
grep으로 찾을 수 없는" 사례가 최소 1곳 더 있었다. 향후 유사 리팩토링에서는
"`!`가 붙은 곳"뿐 아니라 재질 클래스가 선언하는 모든 CSS 속성을 각 사용처의
유틸리티 클래스와 대조하는 전수 조사가 필요하다.
