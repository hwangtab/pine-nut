# 잔여 항목 3건 마무리 — 작업 보고

브랜치: `refactor/remaining-items` (이미 체크아웃된 상태에서 작업, 브랜치 전환 없음)
작업 디렉터리: `/Users/hwang-gyeongha/pine-nut/website`

## ITEM 1 — 밝은 배경용 outline 버튼 변형

### 새 클래스 정의

`website/src/app/globals.css`, `@layer components` 블록 내 `.letter-btn--outline` 바로 아래에 추가:

```css
/* 한지·종이 카드 등 밝은 배경 위에서 쓰는 보조 버튼(잉크 테두리) */
.letter-btn--outline-light {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
.letter-btn--outline-light:hover { background: var(--color-border); }
```

이름은 기존 패밀리(`.letter-btn`, `.letter-btn--primary`, `.letter-btn--outline`)를 따라
"밝은 배경용 outline" 역할을 그대로 드러내는 `.letter-btn--outline-light`로 지었다.
크기·패딩·gap·정렬(`display: inline-flex; padding: 12px 24px; gap: 8px; border-radius: pill`)은
`.letter-btn` 베이스에서 그대로 상속되므로 변형 클래스는 색만 담당한다.

### 적용

`website/src/components/petition/PetitionSuccess.tsx:103`

변경 전:
```
className="min-h-[48px] px-6 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-border)]"
```

변경 후:
```
className="letter-btn letter-btn--outline-light min-h-[48px] font-semibold"
```

`min-h-[48px]`와 `font-semibold`는 일반 Tailwind 유틸리티로 그대로 남겨, `@layer components`
경계 덕분에 각각 `.letter-btn`의 `min-height: 44px`/`font-weight: 700`을 정상적으로 덮어쓴다
(`!` 불필요, 실측으로 48px 확인 — 아래 참고). `padding: 12px 24px`(px-6 py-3와 동일값)와
`gap: 8px`(gap-2와 동일값)는 이미 `.letter-btn`에 있으므로 중복 유틸리티를 넣지 않았다.
아이콘 레이아웃(Copy → Check 교체), copy/copied 상태 로직은 손대지 않았다.

### 다른 hand-rolled 버튼 검색

```
grep -rn 'rounded-full border border-\[var(--color-border)\]' src --include="*.tsx"
```

결과 8건(`error.tsx` 2건, `board/page.tsx` 2건, `ReportButton.tsx`, `CommentSection.tsx`,
`BoardPostActions.tsx`, `PetitionSuccess.tsx` 자기 자신). 판단:

- **`website/src/app/error.tsx:52,58`** — 두 `<Link>`(홈으로/서명 참여)가 `min-h-[48px] px-6 py-3
  rounded-full border border-[var(--color-border)] text-[var(--color-text)] font-semibold
  hover:bg-[var(--color-bg)]`로, 크기·패딩·폰트굵기까지 PetitionSuccess 원본과 완전히 같은
  체급의 버튼이었다. **전환함** → `letter-btn letter-btn--outline-light min-h-[48px]
  font-semibold`. 참고로 원래는 배경 미지정(투명) + `hover:bg-[var(--color-bg)]`였는데, 이
  `<main>`의 실제 배경이 이미 `--color-bg`라서 그 hover는 사실상 무동작(no-op)이었다. 새
  변형을 적용하면서 hover가 `--color-border`로 바뀌어 눈에 보이는 호버 반응이 생겼다 — 콘텐츠
  변경은 아니고 dedup의 부수 효과.
- **`website/src/app/mypage/page.tsx:60`** — "홈으로" 링크가 `.paper` 카드 위 rounded-full
  outline 버튼이라 겉보기엔 유사 후보였지만, **전환하지 않음**. 같은 줄에 나란히 있는
  "관리자 페이지로"(`px-5 py-3 rounded-full` forest 배경)와 `LogoutButton.tsx`(`px-5 py-3
  rounded-xl`)가 모두 `px-5 py-3` 체급으로 통일돼 있다. `letter-btn`은 패딩을 `12px 24px`(px-6
  py-3)로 하드코딩해서, 이 버튼 하나만 전환하면 같은 행의 3개 버튼 크기가 어긋난다. 형제
  버튼들까지 건드리는 건 이번 스코프(petition 버튼 1개 전환) 밖이라 보류.
- **`board/page.tsx`, `ReportButton.tsx`, `CommentSection.tsx`, `BoardPostActions.tsx`** —
  전부 `px-3~4 py-1.5~2 text-xs~sm` 체급의 소형 필터 칩/액션 버튼으로, `letter-btn`이 강제하는
  `min-height: 44px`, `font-size: 15px`, `padding: 12px 24px`와 체급이 다르다. 전환하지 않음
  (전환 시 칩이 부풀어 시각적 회귀).

## ITEM 2 — 낡은 가드 스크립트 2건

### `website/scripts/check-home-page-refactor.mjs`

`src/app/page.tsx`는 82d4c30에서 라우트 메타데이터 전용 서버 컴포넌트로 축소됐고, 섹션
컴포지션은 `src/components/home/HomeClient.tsx`로 이동했다(이유는 `page.tsx` 상단 주석 및
CLAUDE.md 확인 완료). `HomeClient.tsx`를 직접 읽어 `HomeAboutSection`, `HomeImpactSection`,
`HomeHopeSection`, `HomeQuotesSection`, `HomeStatsSection` 5개 모두 실제로 조합되고 있음을
확인했다.

변경: `pagePath`를 `src/app/page.tsx` → `src/components/home/HomeClient.tsx`로 교체하고
한글 주석 추가. "removed responsibility" 목록(`EditableText`, `EditableImage`,
`EditableList`, `FadeIn`, `PineTreeIcon`, `home.impact.cards` 등)도 재검토했는데, 이 문자열들
역시 `HomeClient.tsx`에 하나도 없음을 grep으로 재확인했다(실제 책임은 각 섹션 컴포넌트가
갖고 있음) — 그대로 유지해도 `HomeClient.tsx` 기준으로 여전히 유효한 검증이라 손대지 않았다.
180줄 제한도 `HomeClient.tsx`(125줄)에 재적용해 그대로 유효.

이 과정에서 **스코프 밖의 세 번째 실패**를 발견했다: `HomeImpactSection.tsx`가 `gradients`
문자열을 포함해야 한다는 어서션(파일 뒷부분, 손대지 않은 블록)이 실패한다. `git log`로
확인하니 **어제(2026-08-19) 커밋 `b5fc309` "홈 위협 섹션 단색 카드 폐기 — 종이 카드·번호·잉크
고대비로 재구성"**이 그라디언트 카드 디자인을 완전히 걷어내면서 `gradients` 식별자가
사라졌다. 성격상 동일한 "코드가 맞고 가드가 낡음" 패턴으로 보이지만, 이번 작업 지시는
`check-home-page-refactor.mjs`의 page.tsx/HomeClient 관련 항목과 `check-timeline-client-
refactor.mjs`의 `useInView` 항목, 이 두 가지로 명시적으로 스코프가 한정돼 있어 **임의로
고치지 않고 보고만** 한다. (아래 "가드 스위트 결과" 참고)

### `website/scripts/check-timeline-client-refactor.mjs`

`TimelineCard.tsx`가 `useInView`, `Image`, `imageSourceLabel`, `categoryStyles` 4개를 모두
포함해야 한다는 어서션(80~83행)을 개별 확인:

- **`useInView`** — 더 이상 없음. `TimelineCard.tsx`는 이제 `@/lib/use-reveal`의 자체 훅
  `useReveal`을 쓴다(`const { ref, inView } = useReveal<HTMLDivElement>();`). `use-reveal.ts`를
  읽어 확인 — IntersectionObserver 기반으로 뷰포트 진입 시 1회 `inView=true`, `.reveal` +
  `.is-visible` CSS 클래스 토글에 사용. 스크롤 리빌 동작 자체는 그대로고 구현 메커니즘만
  framer-motion → 자체 훅으로 바뀐 것 → **가드가 낡음**. `useReveal`로 교체.
- **`Image`** — 여전히 있음(`import Image from "next/image"`, `<Image .../>`). 실제로 살아있는
  요구사항 → 그대로 유지.
- **`imageSourceLabel`** — 여전히 있음(`timelineConfig.imageSourceLabel`). 그대로 유지.
- **`categoryStyles`** — 여전히 있음(로컬 변수 `categoryStyles = timelineConfig.categoryStyles[...]`).
  그대로 유지.

변경은 `useInView` → `useReveal` 1건뿐이고, 왜 바뀌었는지 한글 주석을 어서션 바로 위에 추가했다.

## ITEM 3 — 드리프트 방지 주석

리팩토링은 하지 않음(지시대로). 두 파일 최상단(`"use client";` 바로 아래)에 서로를 가리키는
한글 주석만 추가:

- `website/src/app/donate/page.tsx` — 영문판이 `Donate*Section`을 공유하지 않는 이유(한국어
  `defaultValue`·`donate.*` contentKey에 언어 종속돼 공유 시 콘텐츠 플러밍 전체 재작업이
  필요하다는 트레이드오프 판단)와, 이 페이지의 시각적 변경은 영문판에도 수동 반영해야 한다는
  점을 명시.
- `website/src/app/en/donate/page.tsx` — 대칭되는 주석. 한국어판을 가리키며 동일한 이유와
  반영 의무를 명시.

콘텐츠(`contentKey`/`defaultValue`/카피)는 전혀 건드리지 않았다.

## 검증

### lint / build

```
npm run lint   → 통과 (경고/에러 없음)
npm run build  → 성공. sitemap 생성 중 "Supabase is not configured in production for
                 published news" 경고가 뜨지만 이는 로컬 빌드 환경에 Supabase 프로덕션
                 키가 없어서 나는 기존 상태이며, 이번 변경과 무관.
```

### 가드 스위트 (44개 `*:check` 스크립트 전수 실행)

**결과: 43 pass / 1 fail**

실패 1건은 Item 2에서 지시받은 두 스크립트가 아니라 `home-page:refactor:check` 안의 별도
어서션(`HomeImpactSection must include gradients.`)이다. 원인은 위 Item 2 절에 설명한 대로
2026-08-19 커밋 `b5fc309`가 그라디언트 카드 디자인을 제거하면서 생긴 것으로, 스코프 밖이라
"억지로 초록불로 만들지 말고 보고하라"는 지시에 따라 그대로 두었다. 두 지시된 스크립트
(`home-page:refactor:check`의 page→HomeClient 부분, `timeline-client:refactor:check`의
`useInView`→`useReveal` 부분)는 정상적으로 통과한다.

### `/petition` 성공 화면 — 복사 버튼 실측 (chrome-devtools MCP, 데스크톱 1440×900×1)

폼 제출 → 성공 화면 도달 → "URL 복사" 버튼(`letter-btn letter-btn--outline-light min-h-[48px]
font-semibold`) computed style:

| 속성 | 값 |
|---|---|
| min-height | **48px** (계획대로 유틸리티가 이겼다) |
| height(실측 렌더 높이) | 54.6px (텍스트+아이콘으로 min-height보다 커짐, 정상) |
| font-size | 15px (`.letter-btn` 값, 원본엔 명시적 크기가 없어 브라우저 기본값이었음 —
  체급 통일을 위한 의도된 차이) |
| font-weight | 600 (`font-semibold`가 `.letter-btn`의 700을 정상적으로 덮어씀) |
| color | `rgb(34, 48, 31)` = `--color-text` |
| background-color | `rgb(250, 247, 239)` = `--color-bg` |
| border | `1px solid rgb(227, 223, 208)` = `--color-border` |
| border-radius | 999px (pill) |
| gap | 8px (원본과 동일) |
| display(used value) | `flex`(부모 flex 컨테이너의 flex item이라 `inline-flex`가
  blockify된 것 — CSS 스펙상 정상, 실제 명시값은 `inline-flex`) |

**대비율(WCAG)**: 텍스트 `rgb(34,48,31)` vs `.paper` 카드 배경 `rgb(255,253,247)` →
**13.67:1** (AA 4.5:1, AAA 7:1 모두 크게 상회). 버튼 자체 배경(`--color-bg`,
`rgb(250,247,239)`) 대비로도 12.99:1로 사실상 동일.

### 클릭 트랜스크립트

1. `mcp__chrome-devtools__click`(uid=28_7, "URL 복사")을 실행하고 바로 이어서
   `evaluate_script`로 상태 확인 → 텍스트가 `복사됨!`으로, 아이콘이 Copy(사각형+화살표)에서
   Check(체크 경로)로 정확히 스왑됨. 배경도 hover 상태(`rgb(227,223,208)` = `--color-border`,
   클릭 후 커서가 버튼 위에 남아 있어 hover 유지)로 확인.
2. 참고: 처음 두 번의 시도에서는 클릭과 상태 확인 사이에 여러 툴 호출(콘솔 로그 조회 등)이
   끼어들어 실측까지 걸린 실제 시간이 `setTimeout(() => setUrlCopied(false), 2000)`의 2초
   윈도우를 넘겨버려 "복사됨" 상태를 놓쳤다(원복된 뒤 관측). 클립보드 권한도
   `navigator.permissions.query({name:'clipboard-write'})` → `granted`로 확인했고,
   `navigator.clipboard.writeText` 자체는 항상 성공했다. 클릭 직후 바로 상태를 읽은 3번째
   시도에서 정상 스왑을 확인했다 — **로직 버그 아님, 툴 호출 간 지연 때문의 관찰 실패였음**.
   `onCopyUrl`/`handleCopyUrl`(`src/app/petition/page.tsx`) 로직은 이번 작업에서 전혀
   건드리지 않았다.

스크린샷: 성공 화면에서 카카오톡 공유(노랑) / 트위터 공유(파랑) / URL 복사(크림+테두리)
3개 버튼이 나란히 같은 높이로 정렬되고, URL 복사 버튼만 밝은 배경 outline 스타일로 시각적
위계가 자연스럽게 구분되는 것을 확인했다.

### `/donate`, `/en/donate`

```
curl /donate     → 200, <title>후원하기 — 풍천리를 지켜주세요</title>
curl /en/donate  → 200, <title>Support the Campaign — Save Pungcheon-ri</title>
```
chrome-devtools로 `/donate` 네비게이션 후 콘솔 에러 없음. 두 페이지 모두 파일 최상단 주석
추가 외에는 아무 것도 바뀌지 않았으므로 렌더링은 기존과 동일하다(코드 diff 자체가 주석
5줄 추가뿐).

## 커밋

브랜치 `refactor/remaining-items`에 아래 파일들을 커밋:

- `website/src/app/globals.css` (신규 `.letter-btn--outline-light` 변형)
- `website/src/components/petition/PetitionSuccess.tsx` (버튼 클래스 교체)
- `website/src/app/error.tsx` (동일 패턴 버튼 2건 전환)
- `website/scripts/check-home-page-refactor.mjs` (page.tsx → HomeClient.tsx 재조준)
- `website/scripts/check-timeline-client-refactor.mjs` (useInView → useReveal)
- `website/src/app/donate/page.tsx`, `website/src/app/en/donate/page.tsx` (드리프트 방지 주석)

`website/COMPREHENSIVE_CODE_REVIEW.md`는 이 세션이 만든 파일이 아니고(작업 시작 시점부터
untracked 상태) 이번 작업 범위와 무관해 커밋에서 제외했다.

## 확신이 서지 않는 부분 / 남은 이슈

1. **`HomeImpactSection`의 `gradients` 어서션 실패(43/44)** — Item 2 지시 범위 밖이라 고치지
   않았지만, 성격은 동일한 "코드가 맞고 가드가 낡음" 케이스로 보인다. 다음 라운드에서 함께
   정리하는 걸 권장.
2. **`mypage/page.tsx`의 "홈으로" 버튼** — 새 변형과 시각적으로 유사하지만 형제 버튼들과의
   패딩 체급(px-5 vs px-6) 때문에 전환하지 않았다. 이 판단에 동의하지 않는다면 별도로
   그 버튼 행 전체(3개)를 함께 리디자인하는 게 안전할 것.
3. **`error.tsx` 버튼의 hover 동작 변화** — 기존엔 `hover:bg-[var(--color-bg)]`가 페이지 배경과
   같은 색이라 사실상 무동작이었는데, 이번 전환으로 `--color-border`로 눈에 띄게 바뀐다.
   의도적으로 유익한 부수효과라 판단해 반영했지만, 순수 리팩토링만 원했다면 되돌릴 수 있다.
