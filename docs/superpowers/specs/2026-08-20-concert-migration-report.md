# `/concert` 페이지 "숲의 편지" 마이그레이션 보고서

브랜치: `refactor/remaining-items` · 대상 파일: `website/src/app/concert/page.tsx` (ConcertHero.tsx는 검토 결과 변경 불필요, 파일 자체는 무수정)

## 0. 전제 재확인

작업 지시대로 렌더링 결과를 다시 확인했다. 포스터 정체성은 히어로(`ConcertHero.tsx`)의 대형 디스플레이 헤드라인 "베어지기 전에 / 풍천리"와 상태 배지("공연 종료"/D-day, 네온 그린 `#3BEF7C`)에만 존재한다. 본문은 손으로 짠 `bg-white` + `shadow-card` + `border` 카드, 산세리프 제목, 앰버 강조가 전면에 깔린 평범한 라이트 콘텐츠 페이지였다. 지시대로 히어로의 두 요소만 남기고 본문 전체를 하우스 시스템으로 이관했다.

## 1. 파일별 결론

- `website/src/app/concert/ConcertHero.tsx` — **무수정**. 헤드라인(`font-black`, 핑크/그린)과 D-day 배지(`text-[#3BEF7C]`)는 승인된 예외라 원본 그대로. 그 외 요소(RidgeDivider, 배경 그라디언트, CTA 버튼 2개)를 점검했으나 glass/frost, 잘못된 `font-black`, 앰버 오남용, `font-hand` 오남용, 배경 밴딩 문제 중 어느 것도 해당하지 않아 손댈 이유가 없었다. CTA 버튼은 손수 작성된 클래스지만 이미 `.letter-btn--primary`/`--outline`와 시각적으로 동등하고(앰버 서명 버튼 + 사진 배경 위 반투명 아웃라인), 히어로 파일에 불필요한 diff를 만들지 않기 위해 그대로 두었다.
- `website/src/app/concert/page.tsx` — 전면 재스킨. 아래 섹션별 표.

## 2. 섹션별 변경

| 섹션 | Before | After |
|---|---|---|
| 공연 안내(4카드) | `bg-white border shadow-card`, `font-black` 값 | `.paper` + `relative z-[1]` 래퍼, `font-bold` |
| 왜 이 공연인가 — 카피 | 중앙정렬 영문 킥커(warm) + 중앙정렬 h2 | 좌측정렬, 킥커 forest, h2에 `font-serif-display font-bold` 추가 |
| 왜 이 공연인가 — 사진 2장 | `overflow-hidden rounded-panel border shadow-card` + 사진 위 그라디언트+흰 텍스트 오버레이 캡션(첫 장), 캡션 없음(둘째 장) | `.photo-frame`(둘째 장은 `paper-tilt-r` 추가, 첫 장은 무틸트 — 3장 중 1장만 틸트) + `figcaption`을 사진 **아래**로 이동, `font-hand`로 스타일(캡션 텍스트 원문 그대로) |
| 왜 이 공연인가 — 인용 블록 | `border-l-4 border-warm bg-bg-warm` | 좌측 보더만 forest로, 배경(`bg-bg-warm`)은 강조 패널로서 실질적 역할이 있어 유지 |
| 위기의 숫자 | `bg-forest`(다크 네온 밴드), 킥커/스탯 `#3BEF7C`/`#FF8CA0`, `font-black`, CTA 링크 손수 아웃라인 | `bg-[var(--color-deep)]`(다크 밴드 전용 토큰), 킥커 `--color-earth-light`, 스탯 alternation `--color-earth-light`/`--color-forest-light`, `font-serif-display font-bold`(font-black 제거), CTA를 `.letter-btn--outline`로 교체, 좌측정렬 |
| 타임테이블 | 행마다 `bg-white border shadow-card hover:border-warm/40`, 순번 `font-black text-warm` | `.paper` 행 + `z-1` 래퍼, hover 보더 forest/40, 순번 `font-bold text-forest`, 헤딩 좌측정렬 + serif-display |
| 이렇게 함께해주세요 | 섹션 `bg-bg-warm`, 카드 `bg-white border shadow-card`, 아이콘 원 `bg-warm/10 text-warm` | 섹션 `bg-[var(--color-bg-moss)]`(HomeCtaSection 카드그리드 선례와 동일 패턴), 카드 `.paper`, 아이콘 원 forest, 좌측정렬 |
| 현장 부스 | 프로모 박스 `border shadow-card bg-bg-warm`, 내부 칩 `bg-white/70` | 박스를 `.paper`로, 내부 칩 `bg-[var(--color-bg)]` |
| 오시는 길 | 정보박스 2개 `bg-white border shadow-card`, 부제 중앙정렬, 지도 버튼 행 중앙정렬 | 정보박스 `.paper`, 헤딩·부제 좌측정렬, 버튼 행 좌측시작(모바일은 그대로 풀폭 스택) — 카카오/네이버 버튼은 플랫폼 브랜드색이라 미변경 |
| 공연 개최 후원(CTA 밴드) | 섹션 `bg-bg-warm`, 헤딩 `font-serif`(하우스 토큰 아님) | 섹션 `bg-[var(--color-bg-moss)]`, 헤딩 `font-serif-display`로 교정. HomeCtaSection/TimelineCta와 동일한 "아이콘 없는 중앙정렬 CTA 밴드" 패턴이라 중앙정렬 유지. 버튼(`bg-forest`)은 letter-btn 변형이 없어 미변경 |
| 포스터를 널리 알려주세요 | 섹션 `bg-bg-warm`, 이미지 래퍼 `overflow-hidden rounded-card border shadow-card`, 킥커 warm | 섹션 배경 제거(기본 크림), 래퍼 `.photo-frame`, 킥커 forest, 헤딩 `font-serif-display`. 저장 버튼(`bg-forest`)은 letter-btn 변형이 없어 미변경 |
| FAQ | 카드 `bg-white border shadow-card` | `.paper` + `z-1` 래퍼, 좌측정렬 헤딩 |
| 마무리 CTA | `bg-forest`, 확성기 아이콘 `text-[#3BEF7C]`, 버튼 3개 손수 클래스(앰버 1 + 화이트아웃라인 2) | `bg-[var(--color-deep)]`, 아이콘 `--color-earth-light`, 버튼 3개를 `.letter-btn`(`--primary`/`--outline`)로 교체 |

## 3. 앰버(--color-warm) 15곳 판정

원본 기준 본문 14곳 + 히어로 1곳.

| # | 위치 | 판정 | 근거 |
|---|---|---|---|
| 1 | "Why We Sing" 킥커 | → forest | 섹션 장식 라벨 |
| 2 | "84개월" 본문 강조 숫자 | → forest | 장식적 수치 강조, 버튼 아님 |
| 3 | 인용 블록 좌측 보더 | → forest | 장식 액센트 |
| 4 | "8월 1일, 당신이 앉을 자리..." 강조문 | → forest | 텍스트 강조, 버튼/CTA 아님 |
| 5 | "Time Table" 킥커 | → forest | 섹션 장식 라벨 |
| 6 | 타임테이블 행 hover 보더 | → forest | 규칙에 명시된 "timetable highlights → forest" |
| 7 | 타임테이블 순번 "01" 등 | → forest | 장식적 숫자 |
| 8 | "Join Us" 킥커 | → forest | 섹션 장식 라벨 |
| 9 | PARTICIPATE 아이콘 원 | → forest | 아이콘 |
| 10 | "On-site Booth" 킥커 | → forest | 섹션 장식 라벨 |
| 11 | "Location" 킥커 | → forest | 섹션 장식 라벨 |
| 12 | "Spread the Word" 킥커 | → forest | 섹션 장식 라벨 |
| 13 | "FAQ" 킥커 | → forest | 섹션 장식 라벨 |
| 14 | 마무리 CTA "서명하기" 버튼 | **유지(앰버)** | 진짜 서명 CTA. `.letter-btn--primary`로 이관, 색상은 그대로 앰버 |
| 15(히어로) | "서명으로 함께하기" 버튼 | **유지(앰버)** | 진짜 서명 CTA. 히어로 파일 무수정이라 원본 그대로 |

결과: 13곳 forest로 이관, 2곳(둘 다 서명 CTA) 앰버 유지. `공연 개최를 후원해주세요`의 "후원하러 가기"와 `포스터를 널리 알려주세요`의 "포스터 저장하기"는 원래도 앰버가 아니라 forest였고, 지시받은 판정 대상 15곳에 포함되지 않아 손대지 않았다(둘 다 `.letter-btn`에 forest 변형이 없어 손수 클래스 유지가 합리적이라 판단).

## 4. 정렬 규칙 적용 판단

"섹션 헤딩은 좌측정렬"을 전 섹션에 적용했고, 예외는 딱 두 곳: `공연 개최를 후원해주세요`와 마무리 CTA. 이 둘은 `HomeCtaSection`/`TimelineCta`에 이미 있는 "아이콘(또는 없음) + 중앙정렬 헤딩 + 중앙정렬 서브텍스트 + 버튼 행"의 클로징 CTA 밴드 패턴과 구조가 동일해 그 선례를 따라 중앙정렬을 유지했다. "위기의 숫자" 다크 밴드는 처음엔 CTA 밴드로 볼지 고민했으나, 헤딩 규칙이 "가장 흔한 실수"로 명시적으로 강조된 점을 고려해 좌측정렬로 통일했다(스탯 그리드 각 셀 자체는 기존대로 중앙정렬 유지 — `HomeStatsSection` 선례와 동일).

## 5. 확신이 서지 않는 부분

- **위기의 숫자 밴드 정렬**: 위 4번처럼 좌측정렬로 갔지만, 이 섹션이 CTA 밴드에 더 가깝다고 보면 중앙정렬이 맞을 수도 있다. 리뷰에서 갈릴 수 있는 지점.
- **"공연 개최를 후원해주세요" / "포스터 저장하기" 버튼을 forest로 그대로 둔 것**: 하우스 규칙상 "amber는 signature/donate/share CTA 전용"이라고 명시되어 있어, 이 두 버튼(후원 CTA, 포스터 공유용 다운로드)을 amber로 승격하는 것도 규칙 정신에 맞을 수 있다. 다만 작업 지시가 "기존 15곳 판정"으로 범위를 명확히 좁혔고 이 두 곳은 원래 amber가 아니었으므로, 범위를 넘지 않는 쪽을 택했다. 리뷰어가 이걸 amber로 승격하길 원하면 간단히 반영 가능.
- **FAQ는 아코디언이 아니다**: 작업 지시는 "FAQ disclosure가 열리고 닫히는지 확인하라"고 했지만, 실제 코드는 `<dl>`에 모든 답변이 항상 보이는 정적 리스트였다(`<details>`, `<button>`, `aria-expanded` 전무 — 마이그레이션 전후 동일하게 확인). 즉 지켜야 할 "동작"이 애초에 없다. 새로 아코디언 동작을 추가하는 것은 "behavior frozen" 원칙 위반이라 판단해 정적 구조를 그대로 유지했다.
- **히어로 CTA 버튼을 `.letter-btn`으로 안 바꾼 것**: 작업 지시가 히어로에서 "헤드라인 + 배지"만 예외로 못박아서, 논리적으로는 버튼도 손댈 수 있었다. 하지만 이미 시각적으로 동등하고 히어로 파일 diff를 0으로 유지하는 게 더 안전하다고 판단해 보류했다.

## 6. 린트 / 빌드 원본 출력

```
$ npm run lint
> website@0.1.0 lint
> eslint
(경고/에러 없음, 클린 종료)
```

```
$ npm run build
> website@0.1.0 build
> next build

▲ Next.js 16.1.6 (Turbopack)
✓ Compiled successfully in 3.1s
  Running TypeScript ...
  Collecting page data using 9 workers ...
⚠ Using edge runtime on a page currently disables static generation for that page
  Generating static pages using 9 workers (0/33) ...
Supabase is not configured in production for published news.
sitemap: failed to load published news Error: Supabase is not configured in production for published news.
  (기존부터 있던, /concert와 무관한 sitemap/news 경고)
✓ Generating static pages using 9 workers (33/33) in 296.1ms

Route (app)
...
├ ○ /concert
...
```
`/concert`는 `○ (Static)`으로 정상 프리렌더됨. Supabase/sitemap 경고는 뉴스 sitemap 관련 기존 이슈로 `/concert`와 무관.

## 7. 시각 검증 (before/after)

`git stash`로 원본 코드를 잠깐 복원해 before를 찍고, `stash pop`으로 복구해 after를 찍었다(dev server `localhost:3001`, `.reveal` 강제 표시 initScript 적용).

### 데스크톱 1440×900
- **Before**: 히어로 동일. 본문은 손흰카드(bg-white/shadow-card), 모든 섹션 킥커+헤딩 중앙정렬·앰버색, "위기의 숫자" 밴드가 forest 배경에 네온 핑크(#FF8CA0)/그린(#3BEF7C) `font-black` 숫자, 타임테이블 앰버 순번, Join Us/후원/포스터 섹션이 전부 `bg-bg-warm`(연속 탠 밴딩).
- **After**: 히어로 완전 동일(핑크/그린 헤드라인, 네온 배지 "공연 종료", 리지 디바이더 이음새 매끈함 확인). 본문은 `.paper` 카드(옅은 미색 + 노이즈 텍스처), 킥커/헤딩 좌측정렬·forest색·serif-display, "위기의 숫자"가 `--color-deep`(더 깊은 다크그린) 배경에 earth-light/forest-light 숫자, 타임테이블 forest 순번, Join Us 섹션이 moss 배경으로 분리, 후원/포스터 섹션의 탠 밴딩 제거(moss 1곳 + 기본 크림), FAQ/오시는길 카드가 `.paper`로 통일, 마무리 CTA가 `--color-deep` 배경에 `.letter-btn` 버튼.

### 모바일 390×844
- **Before/After** 모두 2열 스탯 그리드, 스택형 카드 레이아웃 유지. 색·타이포만 위와 동일하게 바뀜. `document.documentElement.scrollWidth`(382) ≤ `window.innerWidth`(390) — 가로 스크롤 없음 확인.

(스크린샷은 도구 호출 결과로 확인했으며 첨부 파일로 저장하지 않음 — 필요시 재현 가능한 절차를 위에 기록.)

## 8. FAQ 상호작용 확인 (트랜스크립트)

```js
// dl 안의 dt/dd 구조를 검사
{
  tag: "DL",
  firstChildTag: "DIV",
  hasDetails: false,
  hasButton: false,
  hasAriaExpanded: false,
  allDdVisible: true   // 4개 답변 모두 offsetHeight > 0, 즉 항상 펼쳐진 상태
}
```
→ 열고 닫는 토글 자체가 존재하지 않음(마이그레이션 전후 동일). "동작 동결" 원칙에 따라 이 정적 구조를 유지했다.

## 9. 세 가지 grep 원문 + 판정

```
$ grep -rn "glass\|frost" src/app/concert --include="*.tsx"
(결과 없음 — 통과)

$ grep -rn "font-black" src/app/concert --include="*.tsx"
src/app/concert/ConcertHero.tsx:45:  <h1 ... font-black ...>          → 승인된 히어로 예외(디스플레이 헤드라인)
src/app/concert/ConcertHero.tsx:58:  <span ... font-black ...>{dday}</span>  → 승인된 히어로 예외(상태 배지)
(page.tsx에는 font-black 0건 — 전부 font-bold로 이관 완료)

$ grep -rn "color-warm" src/app/concert --include="*.tsx"
src/app/concert/ConcertHero.tsx:66: bg-[var(--color-warm)] ... "서명으로 함께하기" 버튼
→ 진짜 서명 CTA, 유지가 맞음(히어로 무수정)
(page.tsx에는 리터럴 color-warm 0건 — 마무리 CTA의 "서명하기"는 .letter-btn--primary 클래스로 앰버를 유지하되
 문자열 자체는 globals.css 쪽에 있어 이 grep에는 안 잡힘. 진짜 CTA라 앰버 유지가 맞는 판정.)
```

## 10. 콘텐츠 무변경 확인 (diff 기반)

`git diff`에서 클래스명/래퍼 div 변경 줄을 모두 제외하고 남는 텍스트 줄을 확인한 결과, 날짜("2026년 8월 1일"), 장소, 전화번호(`010-8748-3044`), 출연진 14팀 이름, 타임테이블 시간/이름, FAQ 문구, 인용문, 안내문 등 모든 가시 텍스트가 한 글자도 바뀌지 않았다. 변경된 비-클래스 텍스트는 딱 두 군데뿐:
1. JSX 주석 `{/* 위기의 숫자 — 다크 네온 밴드(포스터 무드) */}` → `{/* 위기의 숫자 — 다크 밴드 */}` (코드 주석, 화면에 렌더되지 않음)
2. STATS 배열의 `accent` 필드에 연결된 3항연산자의 색상 hex/토큰 값(`#FF8CA0`/`#3BEF7C` → CSS 변수) — 스타일 값이지 카피가 아님, `value`/`unit`/`label` 텍스트 자체는 무변경.

`contentKey`/`defaultValue`도 원래 이 페이지에 전혀 없었고(정적 페이지, 콘텐츠 관리 시스템 미사용) 새로 추가하지도 않았다.

## 11. 요약 diff 통계

```
website/src/app/concert/page.tsx | 287 +++++++++++++++++++--------------------
1 file changed, 138 insertions(+), 149 deletions(-)
```
`website/src/app/concert/ConcertHero.tsx` — 변경 0건.

## 12. 리뷰 대응 정정 (2차 커밋)

리뷰에서 두 건 지적을 받았다.

### FIX 1 — "위기의 숫자" 밴드 대비 실패

`page.tsx:219`에서 스탯 숫자 색을 `--color-earth-light`/`--color-forest-light`로 교대시켰는데, `--color-forest-light`(#4A7A2E)가 `--color-deep`(#1E3317) 위에서 **≈2.67:1**로 3:1(큰 텍스트 최저 기준)에도 못 미쳤다. 리뷰어 확인대로 `--color-forest-light`는 코드베이스 전체에서 "forest 배경 위 흰 버튼의 hover 상태"로만 쓰이고, 다크 배경 위 텍스트로 쓰인 전례가 없었다.

**새 토큰 `--color-forest-on-dark: #6CB83D`**을 `globals.css`의 `:root`(다른 색 토큰들과 나란히)와 `@theme inline`에 추가해 Tailwind 임의값(`text-[var(--color-forest-on-dark)]`)으로 쓸 수 있게 했다.

- **이름**: 외형(밝기)이 아니라 역할(다크 밴드 전용)로 명명 — `--color-forest-on-dark`.
- **유도 방식**: forest 계열 색상족에서 그대로 파생. `--color-forest`(H96.2° S56.9% L20.0%), `--color-forest-light`(H97.9° S45.2% L32.9%)와 나란히 놓고 확인한 결과 새 토큰은 **H97.1° S50.2% L48.0%** — 같은 hue(~96–98°)를 유지한 채 밝기만 올린 값이다. 새로운 색상 계열(민트 등)을 끌어오지 않았다.
- **대비 계산**(Python `colorsys` + WCAG 상대휘도 공식으로 검증):

  | 토큰 | 값 | `--color-deep` 대비 |
  |---|---|---|
  | `--color-earth-light` | `#D4A843` | 6.15:1 |
  | `--color-forest-light`(기존, 폐기) | `#4A7A2E` | 2.67:1 |
  | **`--color-forest-on-dark`(신규)** | `#6CB83D` | **5.56:1** |

  4.5:1 기준을 여유 있게 통과했고(5.56:1), 이 값은 여전히 채도 50%의 뚜렷한 초록으로 읽혀 파스텔/민트로 washed out 되지 않았다 — 조용한 타협 없이 요건을 만족.

- **적용**: `page.tsx`의 STATS 렌더 삼항연산자에서 `text-[var(--color-forest-light)]` → `text-[var(--color-forest-on-dark)]`로 교체(green 계열 2개 항목: 51가구, 1,800ha).

**브라우저 실측 4개 스탯 숫자 computed color**(devtools `getComputedStyle`):

| 스탯 | computed color | hex | `--color-deep` 대비 |
|---|---|---|---|
| 11만그루 (earth) | `rgb(212, 168, 67)` | `#D4A843` | 6.15:1 |
| 51가구 (forest) | `rgb(108, 184, 61)` | `#6CB83D` | 5.56:1 |
| 1,800ha (forest) | `rgb(108, 184, 61)` | `#6CB83D` | 5.56:1 |
| 705회+ (earth) | `rgb(212, 168, 67)` | `#D4A843` | 6.15:1 |

4개 전부 4.5:1을 상회해 다크 밴드 위에서 명확히 읽힌다.

### FIX 2 — "후원하러 가기" 버튼을 앰버로

`page.tsx:408–415`, 캠페인 펀딩 페이지로 연결되는 실제 후원 CTA를 forest로 남겨둔 것은 범위를 "기존 15곳"으로 좁혀 해석한 오판이었다. 규칙은 색이 아니라 **버튼의 기능**(signature/donate/share)으로 앰버 적용 대상을 정의하므로, 이 버튼은 애초에 대상이었다. `bg-[var(--color-forest)]` → `bg-[var(--color-warm)]`, hover도 `hover:bg-[var(--color-warm-light)]`로 교체(hover 전환 클래스를 `transition`에서 `transition-colors`로 정리). 브라우저 실측: `getComputedStyle(...).backgroundColor` → `rgb(199, 80, 0)` = `#C75000` = `--color-warm`. 앰버 적용 확인.

"포스터 저장하기"는 다운로드 동작이라 signature/donate/share에 해당하지 않는다는 리뷰어 판정이 확정되어 forest 그대로 유지, 변경 없음.

### 재검증

`npm run lint`, `npm run build` 재실행 — 둘 다 클린 통과(`/concert` 여전히 `○ Static`). 변경 파일은 `website/src/app/globals.css`(+2줄, 토큰 추가)와 `website/src/app/concert/page.tsx`(4줄, 색상 클래스 2곳 교체) 뿐 — 콘텐츠·`contentKey`·`defaultValue`·`!` 수식자·히어로 무관.
