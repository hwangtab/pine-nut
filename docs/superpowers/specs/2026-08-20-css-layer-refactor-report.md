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
  남아 있으며(git 미추적), 필요 없으면 삭제해도 된다.
