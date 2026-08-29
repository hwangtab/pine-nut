# 풋터 능선(RidgeDivider) 하단 콘텐츠 침범 전수 감사 — 2026-08-20

세 번째 재점검. 이전 스윕들이 "텍스트 하단"만 측정해 카드의 패딩/보더/그림자/라운드 코너가
잘려나가는 걸 놓쳤다는 지적에 따라, 이번에는 **칠해진 박스(배경색/보더/그림자) 하단, 텍스트
하단, 미디어 하단 셋 중 최댓값**을 기준으로 다시 측정했다. 코드 변경 없음 — 진단 전용.

## 방법론

- 로컬 dev 서버(`PORT=3001 npm run dev`), chrome-devtools MCP, `emulate` viewport(390/700/1440,
  dpr=1).
- 측정 스크립트(`measureDoc`)는 각 라우트에서:
  1. 풋터 SVG의 `path.getBBox()`로 실제 능선 정점(crest)을 계산 — `(96 - bbox.y) *
     (svgRenderedHeight / 96)`.
  2. 풋터 이전의 모든 요소를 순회해 "칠해진 박스"(보더/그림자가 있는 요소, 또는 국소적 배경색
     패치)의 최하단, 텍스트 노드의 최하단(Range.getClientRects), 미디어(img/svg/video)의
     최하단을 각각 구하고 셋 중 최댓값을 사용.
  3. `position:fixed` 요소와 그 **자손**(조상 체인 전체를 검사)은 제외, `overflow:hidden`
     조상으로 잘리는 요소는 클리핑된 가시 하단으로 보정.
  4. **구조적 배경판 제외**: 뷰포트 폭의 97% 이상을 차지하면서 보더/그림자/라운드가 없고
     자기 부모의 하단과 1.5px 이내로 일치하는 요소(예: 페이지 최상위 `min-h-screen bg-...`
     래퍼, `next/image fill` 전체화면 배경 사진)는 "칠해진 박스" 판정에서 제외했다. 이런
     요소는 `<main>` 바로 다음이 `<Footer>`인 이 사이트의 레이아웃 구조상(`PublicShell.tsx`)
     **항상** gap=0으로 풋터 상단과 맞닿는다 — Footer.tsx 자체 주석대로 "능선이 앞 섹션 배경
     위에 겹쳐 그려지는" 의도된 설계이지, 버그가 아니다. 이걸 빼지 않으면 사실상 모든 페이지가
     항상 "covered=true"로 나와 무의미해진다.
  5. **스크롤 리빌 애니메이션 무력화**: 이 사이트는 프레이머모션을 걷어내고 `useReveal` +
     `.reveal`/`.is-visible` CSS 클래스(IntersectionObserver 1회성 트리거)로 통일했다
     (`src/lib/use-reveal.ts`, `globals.css:161`). `.reveal`의 초기 상태는
     `transform: translateY(24px); opacity:0`이라, 뷰포트에 안 들어온 요소를 측정하면 실제
     정착 위치보다 24px 아래로 잘못 측정된다. 측정 전 `doc.querySelectorAll('.reveal')`에
     `is-visible` 클래스를 강제 부여해 정착 위치를 측정했다.

### 반복 배치(iframe) 기법과 직접 네비게이션 검증

라우트 28개 × 뷰포트 3 = 84개 조합을 한 번에 처리하려고 숨은 `<iframe>`(같은 오리진, 폭을
390/700/1440px·높이 900px로 고정)에 순차 로드 후 측정하는 방식을 썼다. **`/press`를 세 뷰포트
모두 직접 네비게이션으로도 측정해 대조한 결과 완전히 일치**(gap 80/80/80, crest 30.0/42.0/60.0).
`/board/new`도 1440px·700px 직접 네비게이션으로 재검증해 iframe 결과(gap=40, covered=true)와
정확히 일치했다. **기법 검증 완료, 두 값이 일치.**

과정에서 iframe 기법 자체의 함정 두 개를 발견해 수정했다(최종 데이터에는 반영됨):
- iframe 높이를 처음엔 7000px로 크게 잡았더니 `min-h-screen`/`100vh` 기반 레이아웃이 그 높이
  기준으로 재계산되며 완전히 틀어졌다(`/donate`의 fixed 토스트가 엉뚱한 좌표로 잡힘). 실제
  기기 뷰포트와 같은 900px로 고정해 해결.
- `position:fixed`는 요소 자신만 검사했더니, 부모만 `fixed`이고 자식(카드 UI)은 `static`인
  토스트(`src/components/donate/DonateToast.tsx`)가 걸러지지 않았다. 조상 체인 전체를
  검사하도록 수정.

## 측정 결과 전체 표

라우트 28개 × 뷰포트 3 = 84행. crest는 뷰포트당 고정값(390→30.0px, 700→42.0px, 1440→60.0px) —
전 라우트에서 동일하게 재현되어 측정 일관성을 재확인했다.

| route | 390 gap/void | covered | 700 gap/void | covered | 1440 gap/void | covered |
|---|---|---|---|---|---|---|
| / | 66.0 / 36.0 | No | 67.0 / 25.0 | No | 83.0 / 23.0 | No |
| /story | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 112.0 / 52.0 | No |
| /timeline | 56.0 / 26.0 | No | 56.0 / 14.0 | No | 80.0 / 20.0 | No |
| /petition | 48.0 / 18.0 | No | 64.0 / 22.0 | No | 64.0 / 4.0 | No |
| /donate | 48.0 / 18.0 | No | 64.0 / 22.0 | No | 64.0 / 4.0 | No |
| /press | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 80.0 / 20.0 | No |
| /press/release | 64.0 / 34.0 | No | 80.0 / 38.0 | No | 96.0 / 36.0 | No |
| /press/factsheet | 64.0 / 34.0 | No | 80.0 / 38.0 | No | 96.0 / 36.0 | No |
| /gallery | 43.5 / 13.5 | No | 59.5 / 17.5 | No | 83.5 / 23.5 | No |
| /news | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 80.0 / 20.0 | No |
| /news/ohmynews-100-year-pine-forest | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 80.0 / 20.0 | No |
| /board | 69.6 / 39.6 | No | 69.6 / 27.6 | No | 101.6 / 41.5 | No |
| **/board/new** | 40.0 / 10.0 | No | **40.0 / -2.0** | **Yes (cut 2px)** | **40.0 / -20.0** | **Yes (cut 20px)** |
| /concert | 80.0 / 50.0 | No | 96.0 / 54.0 | No | 96.0 / 36.0 | No |
| /share | 67.8 / 37.7 | No | 67.8 / 25.7 | No | 99.8 / 39.7 | No |
| /privacy | 53.6 / 23.6 | No | 53.6 / 11.6 | No | 69.6 / 9.5 | No |
| /login | 225.8 / 195.8 | No | 225.8 / 183.7 | No | 217.8 / 157.7 | No |
| /signup | 207.0 / 177.0 | No | 218.4 / 176.4 | No | 210.4 / 150.4 | No |
| /en | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 112.0 / 52.0 | No |
| /en/story | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 112.0 / 52.0 | No |
| /en/timeline | 56.0 / 26.0 | No | 56.0 / 14.0 | No | 80.0 / 20.0 | No |
| /en/petition | 48.0 / 18.0 | No | 64.0 / 22.0 | No | 64.0 / 4.0 | No |
| /en/donate | 48.0 / 18.0 | No | 64.0 / 22.0 | No | 64.0 / 4.0 | No |
| /en/press | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 80.0 / 20.0 | No |
| /en/gallery | 43.5 / 13.5 | No | 59.5 / 17.5 | No | 83.5 / 23.5 | No |
| /en/news | 80.0 / 50.0 | No | 80.0 / 38.0 | No | 80.0 / 20.0 | No |
| /en/share | 67.8 / 37.7 | No | 67.8 / 25.7 | No | 99.8 / 39.7 | No |
| /en/privacy | 53.6 / 23.6 | No | 53.6 / 11.6 | No | 69.6 / 9.5 | No |

(원본 raw JSON: `/Users/hwang-gyeongha/pine-nut/measure-390.json`,
`measure-700.json`, `measure-1440.json`; CSV: `/Users/hwang-gyeongha/pine-nut/audit-table.csv`)

## 유일한 실제 결함: `/board/new` (그리고 동형인 `/en` 등가 라우트는 없음 — 영문판에 없음)

`/board/new`는 로그아웃 상태(로컬 dev는 Supabase 자격증명이 없어 `getMyMemberProfile()`이 항상
`null` → 이 브랜치가 항상 렌더링됨)에서 "회원만 글을 쓸 수 있습니다 / 로그인" `paper` 카드를
보여준다. 이 카드의 칠해진 박스(보더+그림자 있음, `bg: rgb(255, 253, 247)`) 하단과 풋터 상단
사이 간격이 **모든 뷰포트에서 정확히 40px 고정**인데, 능선 정점은 뷰포트가 커질수록 30→42→60px로
자란다. 그래서:

- 390px: gap 40 > crest 30 → 안전(여유 10px)
- **700px: gap 40 < crest 42 → 카드 하단 2px 침범**(육안으로는 거의 안 보이는 경계선 수준)
- **1440px: gap 40 < crest 60 → 카드 하단 20px 침범**(스크린샷으로 확실히 확인, 카드의 오른쪽
  아래 라운드 코너·보더·그림자가 능선에 잘려나감)

### 원인 파일/라인

`/Users/hwang-gyeongha/pine-nut/website/src/app/board/new/page.tsx`
- 11행: `<div className="mx-auto max-w-3xl px-4 py-10">` (비로그인 카드를 감싸는 래퍼)
- 31행: 동일 패턴(닉네임 미설정 분기) — 같은 결함을 안고 있을 가능성이 높음(직접 측정은 못
  했지만 구조가 동일)
- 50행: 동일 패턴(정상 글쓰기 폼 래퍼) — 로그인 상태를 로컬에서 재현하지 못해 직접 측정은
  못 했으나 폼 내용이 짧으면 같은 문제가 재현될 수 있음

세 곳 모두 `py-10`(40px) 고정값이고, 사이트의 다른 페이지들이 쓰는 `pt-16 pb-14 md:pt-20
md:pb-20`(TimelineCta.tsx:9)이나 `py-12 md:py-16`(Footer 자체) 같은 **브레이크포인트별 단계
상승이 없다.** 능선 정점이 sm/md에서 계단식으로 커지는데 이 페이지의 패딩만 계단을 안 밟는
게 원인 — `/press`가 예전에 겪었다가 이번 감사에서 이미 고쳐진 것으로 확인된 것과 정확히
같은 유형의 결함이다.

**이중 패딩 누적 여부**: 아니다. `mx-auto max-w-3xl px-4 py-10` 래퍼 하나가 카드 바로 뒤에
바닥 패딩을 담당할 뿐, 그 위에 또 다른 요소의 바닥 여백이 쌓이는 구조가 아니다. `/board`에서
있었다는 이중 패딩 문제와는 다른 유형 — 이건 "패딩이 뷰포트별로 안 커진다"는 단일 원인.

## 스크린샷 확인

- `/Users/hwang-gyeongha/pine-nut/board-new-1440.png` — **결함 확인.** 카드 우측 하단
  라운드 코너/보더/그림자가 능선 파도에 뚜렷하게 잘려 있다.
- `/Users/hwang-gyeongha/pine-nut/board-new-700.png` — 경계선 수준(2px). 육안으로는 거의
  안 보이지만 카드 하단 선이 능선 정점과 픽셀 단위로 맞닿아 있다.
- `/Users/hwang-gyeongha/pine-nut/press-1440-direct.png`, `press-390-direct.png` — **정상.**
  원래 세 번째 제보의 대상이었던 "인용 안내" 카드는 현재 코드에서 하단 여백이 충분히
  확보돼 능선과 카드 사이에 깨끗한 여백이 보인다(1440px 기준 20px 여유). 이전 커밋들
  (`7b7f7ad`, `c45489b` 등)의 수정이 유효하게 반영된 것으로 보인다.
- `/Users/hwang-gyeongha/pine-nut/login-390c.png` — **정상.** 숲 사진 배경이 능선 색과
  자연스럽게 이어지며 카드와는 195px 이상 여유. voidPx 최댓값 후보였으나 실제로는
  `AuthShell`의 `py-28` + `min-h-screen` 중앙 정렬 때문에 카드가 원래 화면 위쪽에 떠 있는
  정상적인 여유.
- `/Users/hwang-gyeongha/pine-nut/timeline-700.png` — **정상(주의: 최초 측정에서는
  오탐이었던 케이스).** "서명에 참여하기" 버튼이 능선 위로 깨끗이 떨어져 있다. 무력화 전
  스크롤 리빌 애니메이션의 초기 오프셋(24px) 때문에 700px에서 10px, 1440px에서 4px 침범으로
  잘못 잡혔던 것을 재확인·정정했다.

## void 최댓값 상위 3건

1. `/login` @ 390px — void 195.8px (배경: `AuthShell`의 숲 사진 + 그라디언트 오버레이,
   카드 자체 bg `rgb(255,253,247)` cream paper)
2. `/login` @ 700px — void 183.7px (동일 배경)
3. `/signup` @ 390px — void 177.0px (동일 구조, `AuthShell` 재사용)

세 건 모두 `AuthShell`의 `min-h-screen` 중앙 정렬 + `py-28` 설계상 여유이며, 빈 배경처럼
보이지만 실제로는 숲 사진(전체화면 `next/image fill`)이 채워져 있어 "빈 공간"이 아니라
"의도된 이미지 여백"이다(스크린샷으로 확인).

## 상태가 정상인 페이지 (건강한 페이지 목록)

`/board/new`를 제외한 **27개 라우트 전부**가 3개 뷰포트 모두에서 covered=false다:
`/`, `/story`, `/timeline`, `/petition`, `/donate`, `/press`, `/press/release`,
`/press/factsheet`, `/gallery`, `/news`, `/news/[slug]`, `/board`, `/concert`, `/share`,
`/privacy`, `/login`, `/signup`, 그리고 `/en` 이하 동일 세트(story/timeline/petition/donate/
press/gallery/news/share/privacy).

가장 여유가 빠듯한 편(하지만 안전)인 곳: `/en/privacy`, `/privacy` (1440px에서 void 9.5px),
`/donate`, `/petition`, `/en/donate`, `/en/petition` (1440px void 4.0px) — 향후 콘텐츠가
조금만 늘어나면 재점검 필요.

## 검증하지 못한 것

- **`/board/[id]`(게시글 상세)**: 로컬 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` 등이 없어
  `board_posts` 테이블에 접근 불가 → `getBoardPosts`/`getBoardPost`가 항상 빈 배열/`null`을
  반환(fail-closed, CLAUDE.md에 문서화된 의도된 동작). 실제 게시글 id를 못 구해 `/board/1`은
  404. 프로덕션 데이터로는 별도 검증 필요.
- **`/mypage`**: 인증 필요 라우트라 비로그인 상태에서 `/login`으로 307 리다이렉트된다.
  자체 콘텐츠가 없어 감사 대상에서 제외.
- **`/board/new`의 세 번째 분기(정상 로그인 후 글쓰기 폼, 50행)**: 로컬에서 로그인을 재현하지
  못해 직접 측정은 안 됐다. 다만 같은 `py-10` 래퍼를 쓰므로 폼 내용이 짧은 경우 동일한 결함이
  나타날 가능성이 있다.
- `voidBgColor`(빈 공간 배경색 자동 샘플링)는 스크롤 좌표 변환 문제로 상당수 라우트에서
  `null`로 나왔다 — 대신 `surfaceEl`/`backdropEl`의 `bg` 값과 스크린샷으로 배경색을 교차
  확인했다(위 스크린샷 섹션 참고).

## 재확인된 기존 수정 사항

- `/press`의 "인용 안내" 카드(최초 세 번째 제보 대상)는 현재 **정상**. Footer.tsx 커밋 이력상
  최근 수정들이 유효했다.
- `/timeline`, `/en/timeline`, `/`(홈)에서 처음엔 "covered"로 나왔던 결과는 전부 **스크롤
  리빌 애니메이션(초기 `translateY(24px)`)을 안 끈 상태에서 측정한 오탐**이었다 — 애니메이션
  무력화 후 재측정하니 전부 안전(void 4~26px)으로 나왔다. 이게 "세 번 신고해도 안 고쳐졌다"는
  현상의 실제 원인 중 하나였을 가능성이 있다: 사람이 스크롤해서 눈으로 보면 리빌이 이미
  끝난 정착 위치를 보게 되므로 실제로는 문제가 없는데, 자동 측정 스크립트가 스크롤 전 상태를
  잘못 캡처하면 없는 버그를 있다고 보고하게 된다. 반대로 이번처럼 애니메이션을 먼저 끄고
  측정하면 실제 정착 위치를 정확히 잡을 수 있다.
