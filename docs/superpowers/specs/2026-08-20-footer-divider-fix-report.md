# 풋터 RidgeDivider 배경 이음매 버그 수정 보고서

브랜치: `fix/footer-divider` (이미 체크아웃된 상태에서 작업)

## 1. 문제 요약

`website/src/components/Footer.tsx`의 `RidgeDivider`가 `<footer>` 안, 문서 흐름(normal flow) 위에 투명 배경으로 놓여 있었다. `<footer>`는 `<main>`의 형제 요소이므로, 능선의 음각(투명) 부분은 앞 섹션의 배경이 아니라 `<body>` 배경(`--color-bg`, #FAF7EF 크림색)만 비쳤다. 그 결과 홈(마지막 섹션이 어두운 통계 밴드)과 `/timeline`(CTA가 `--color-bg-warm` 모래빛으로 끝남) 등에서 이음매/색 밴드가 보였다.

## 2. Before / After 마크업

**Before** (`Footer.tsx:25-28`):
```tsx
<footer role="contentinfo">
  {/* 배경은 투명 — 앞 섹션 배경이 비쳐야 한다 */}
  <RidgeDivider className="text-[var(--color-deep)] -mb-px" />
  <div className="bg-[var(--color-deep)] text-white">
```

**After**:
```tsx
<footer role="contentinfo" className="relative">
  {/* footer는 main의 형제라 flow 안에 두면 능선의 투명 여백에 body 배경(--color-bg)만 비친다 —
      어떤 페이지의 마지막 섹션이든 맞게 하려면 이 div는 레이아웃 높이를 차지하지 않고,
      능선을 앞 섹션 위에 겹쳐 그려 능선의 음각 자체가 앞 섹션 내용이 되게 한다.
      -bottom-px는 절대배치 경계에서 생기는 서브픽셀 이음매를 능선이 어두운 블록 위로 1px 겹치게 해 지운다. */}
  <div className="relative h-0">
    <RidgeDivider className="absolute -bottom-px left-0 text-[var(--color-deep)]" />
  </div>
  <div className="bg-[var(--color-deep)] text-white">
```

`SubHero.tsx:98`, `ConcertHero.tsx:34`, `HomeHeroSection.tsx:37`의 기존 3개 사용처는 손대지 않았다 — 이미 `absolute bottom-0` 패턴을 올바르게 쓰고 있었다.

## 3. 메커니즘

- `<footer>`에 `relative`를 주고, 그 바로 안쪽에 레이아웃 높이 0인 `relative` 래퍼 div를 둔다. 이 div의 위치는 (main의 마지막 섹션이 끝나는 지점 = footer가 시작하는 지점)과 정확히 일치한다.
- `RidgeDivider`를 이 래퍼 안에서 `absolute -bottom-px`로 배치하면, SVG 높이(최대 80px, `md`)만큼 **위쪽으로** 확장되어 `<main>`의 마지막 80px 위에 겹쳐 그려진다.
- footer(및 그 자손)는 DOM 순서상 `<main>` 뒤에 오므로, 별도 `z-index` 없이도 기본 페인트 순서상 앞 섹션 위에 그려진다. `<main>`이나 그 자손에 `overflow-hidden`이 없는 한 잘리지 않는다(실제로 없음을 확인).
- 즉 능선의 "음각"은 이제 더 이상 CSS로 추측한 배경색이 아니라, **실제로 그 아래 렌더링된 앞 섹션의 진짜 픽셀**이다. 따라서 어떤 페이지의 마지막 섹션 색이든 구조적으로 항상 일치한다.

## 4. 헤어라인 처리

절대배치 경계(`bottom: 0`)에서 서브픽셀 반올림에 의해 능선 SVG 하단과 풋터의 어두운 블록 상단 사이에 1px 미만의 미세한 틈이 생길 수 있다는 우려가 있었다. `bottom-0` 대신 `-bottom-px`(`bottom: -1px`)를 사용해 능선을 어두운 블록 위로 의도적으로 1px 겹치게 했다. 이전의 `-mb-px`(문서 흐름용 마진 보정)는 절대배치 컨텍스트에서는 의미가 없으므로 제거했다.

## 5. 페이지별 스크린샷 검증 (데스크톱 1440×600×1, 모바일 390×600×1)

모든 페이지에서 **가로 스크롤 오버플로 없음**(`document.documentElement.scrollWidth - window.innerWidth` 확인, 전부 -8, 즉 오버플로 없음 — 스크롤바 폭 보정치).

| 페이지 | 마지막 섹션 배경 | 데스크톱 | 모바일 | 비고 |
|---|---|---|---|---|
| `/` (홈) | `--color-deep` (통계 밴드) | 완전 이음매 없음 | 완전 이음매 없음 | 두 색이 동일(#1E3317)해서 능선 자체가 시각적으로 안 보임 — 의도대로. 통계 숫자/라벨과 충분한 간격 |
| `/timeline` | `--color-bg-warm` (CTA 그라디언트) | 완전 이음매 없음, 산등성이가 모래빛 위로 뚜렷하게 떠오름 | 동일 | "서명에 참여하기" 버튼 능선 위로 충분히 여유 |
| `/story` | `--color-forest` (CTA 섹션, #2D5016) | 이음매 없음 — forest→deep 두 톤 그린 전환(의도된 디자인) | 동일 | "서명하기"/"후원하기" 버튼 능선과 충분히 이격 |
| `/petition` | 크림 카드 섹션 | 이음매 없음 | 이음매 없음 | 마지막 카드 텍스트 능선과 충분히 이격 |
| `/gallery` | 크림 CTA 섹션 + **섹션 밖의 저작권 안내문** | **데스크톱에서 저작권 문구 일부 가려짐 — 아래 6항 참조** | 가려지지 않음 | 아래 참조 |
| `/concert` | `--color-forest` 계열 다크 CTA | 이음매 없음 | 이음매 없음 | 버튼 3개 모두 충분히 이격 |
| `/board` | 크림(빈 게시판 "글이 없습니다.") | 이음매 없음 | 이음매 없음 | 개발 시드에 게시글 없음 — 정상 |
| `/en` | `--color-forest` 계열 다크 CTA | 이음매 없음 | 이음매 없음 | "Sign the Petition" 버튼 충분히 이격 |
| `/en/timeline` | `--color-bg-warm` (CTA 그라디언트, `TimelinePage.tsx` 재사용) | 이음매 없음, 산등성이 효과 정상 | 이음매 없음 | "Sign the petition" 버튼 충분히 이격 |

## 6. 유일한 우려 사항 — `/gallery` (및 `/en/gallery`) 데스크톱

`src/app/gallery/page.tsx:163-172`의 "사진 출처" 저작권 고지 문단은 **섹션 밖, `<main>`에 직접** 놓여 있고 배경색이 없다(`max-w-5xl mx-auto px-4 pb-8 text-center`, 아래쪽 여백은 `pb-8`=32px뿐).

- 이 문단의 렌더링 높이는 텍스트(약 20px) + `pb-8`(32px) = 총 52px로, 풋터 상단까지의 거리가 52px에 불과하다.
- 능선의 최고점(SVG 내부 y=6/96, 크레스트)은 `md` 브레이크포인트(80px 렌더 높이)에서 풋터 상단으로부터 약 75px 위까지 올라온다.
- Canvas `Path2D.isPointInPath`로 정밀 측정한 결과: 문단 텍스트의 세로 중앙·하단 라인은 **테스트한 모든 x 좌표(220~1212px)에서 능선에 덮였고**, 텍스트 최상단 라인도 절반 이상의 x 좌표에서 덮였다. 즉 데스크톱(`md` 이상)에서 이 저작권 문구는 능선 아래 부분적으로 가려진다.
- **모바일**(`sm` 미만, 능선 렌더 높이 40px)에서는 크레스트가 최대 약 37.5px까지만 올라오므로 문구가 가려지지 않음을 스크린샷으로 확인했다.
- 동일한 패턴(`max-w-5xl mx-auto px-4 pb-8 text-center` + `contentKey="en.gallery.copyright.text"`)이 `src/app/en/gallery/page.tsx:148`에도 있어 `/en/gallery` 데스크톱에서도 같은 문제가 있을 것으로 판단된다(실제 스크린샷은 안 찍었음 — 지시된 페이지 목록에 없었음).

**이 건은 지시에 따라 고치지 않고 보고만 한다** ("If any page's last section has too little bottom padding, report it rather than silently reducing the ridge height"). `gallery/page.tsx`는 이번 브랜치의 범위(풋터/RidgeDivider)를 벗어나는 별도 컴포넌트이고, 콘텐츠 동결 지시와도 무관한 순수 레이아웃 이슈이므로 후속 작업으로 넘긴다. 제안: 저작권 안내문 래퍼의 `pb-8`을 `pb-24`(96px) 이상으로 늘리거나, 안내문을 마지막 `ManagedSection`(배경 있는 섹션) 안으로 옮기면 해결된다.

## 7. `TimelinePage.tsx` 오프팔레트 색상 수정

`src/components/timeline/TimelinePage.tsx:39`의 페이지 래퍼 그라디언트가 `to-stone-50`(Tailwind 뉴트럴, 이 프로젝트 팔레트에 없음)으로 끝나고 있었다. `min-h-screen` 래퍼는 실제 콘텐츠가 화면보다 훨씬 길어서, 그라디언트의 마지막 구간(`stone-50`에 가까운 색)이 `TimelineCta`의 `to-transparent`가 위로 갈수록 투명해지는 구간과 겹쳐 살짝 비쳐 보일 수 있는 위치였다. `to-[var(--color-bg)]`로 교체했다 — 그라디언트가 `via-[var(--color-bg)]`에서 이미 도달한 크림 톤을 그대로 유지하며 끝나므로, 팔레트 이탈 없이 "나머지 사이트와 맞아떨어지는" 결과가 된다.

**`TimelineCta.tsx:8`의 `bg-gradient-to-t from-[var(--color-bg-warm)] to-transparent`는 그대로 둬도 된다는 결론**: 이 섹션 자체의 그라디언트는 능선 오버레이와 별개로 독립적으로 동작한다. 능선은 이 섹션의 이미 렌더링된 픽셀(맨 아래는 불투명 `--color-bg-warm`) 위에 그려질 뿐이며, 그 위쪽 투명~불투명 전환은 여전히 "일반 페이지 배경에서 모래빛 CTA 밴드로 강조되며 진입 → 그 위에 어두운 풋터가 땅처럼 솟아오름"이라는 3단 시각 흐름을 만드는 데 필요하다. 변경 불필요.

## 8. 오프팔레트 색상 스캔

`grep -rn "bg-stone-\|bg-neutral-\|bg-gray-\|bg-slate-\|to-stone-\|to-neutral-\|to-gray-\|to-slate-" src --include="*.tsx"` 실행 결과:

| 파일 | 판단 |
|---|---|
| `src/components/timeline/TimelinePage.tsx:39` (`to-stone-50`) | **수정함** — 페이지 레벨 배경, 팔레트 이탈. 위 7항 참조 |
| `src/components/admin/ConfirmModal.tsx:106` | 유지 — 관리자 확인 모달 버튼, 편집 UI 전용 뉴트럴 |
| `src/components/admin/toolbar/AdminToolbarMain.tsx:47` | 유지 — 관리자 편집 툴바(플로팅), 콘텐츠 배경과 무관한 관리 UI 서피스 |
| `src/components/admin/toolbar/AdminToolbarNotice.tsx:3` | 유지 — 관리자 툴바 알림, 동일 사유 |
| `src/components/admin/dialogs/RevertKeyDialog.tsx:38` | 유지 — 관리자 다이얼로그 |
| `src/components/admin/dialogs/DiscardChangesDialog.tsx:35` | 유지 — 관리자 다이얼로그 |
| `src/components/editable/EditableLink.tsx:159,168` | 유지 — 관리자 편집 모달 내부의 `<code>` 인라인 스타일 및 버튼, 콘텐츠 편집 UI 전용 |
| `src/components/editable/EditableValue.tsx:102` | 유지 — 관리자 편집 모달 버튼 |
| `src/components/editable/EditableImage.tsx:145` | 유지 — 관리자 이미지 업로드 UI 버튼 |
| `src/components/editable/EditableRichText.tsx:187` | 유지 — 관리자 편집 모달 버튼 |
| `src/components/editable/editable-list/EditableListModal.tsx:55,64,72,129` | 유지 — 관리자 리스트 편집 모달 |

`/admin` 경로 자체가 아니더라도, 위 항목들은 전부 로그인한 관리자가 콘텐츠를 편집할 때만 노출되는 오버레이/모달/툴바 UI로, "의도적으로 뉴트럴인 관리자 서피스"에 해당한다고 판단해 손대지 않았다(지시사항의 예외 조건과 일치, `/admin` 금지 지시와도 정신이 같다). 페이지 레벨 배경(방문자가 항상 보는 화면)에 걸린 것은 `TimelinePage.tsx` 1건뿐이었다.

## 9. 콘텐츠 동결 확인

`Footer.tsx`에서 마크업 구조만 바꿨고 `contentKey`/`defaultValue`는 전혀 건드리지 않았다. `FooterContact.tsx`는 아예 열지 않았다(Read만 해서 확인). 전화번호(`010-8918-8933`)와 후원 계좌(`농협 356-1559-4666-63 이창후`)는 위 6항의 홈/영문 스크린샷에서 그대로 노출되는 것을 육안으로도 재확인했다.

## 10. 가드 스위트 / 린트 / 빌드

- `node -e "..."`로 나열한 `*:check` 스크립트 44개를 전부 실행 — **44/44 PASS, 0 FAIL**.
- `npm run lint` — 에러/경고 없이 통과(출력 없음).
- `npm run build` — 성공, 모든 라우트(`/`, `/timeline`, `/story`, `/petition`, `/gallery`, `/concert`, `/board`, `/en`, `/en/timeline` 등) 정상 생성.

## 11. 접근성 / 상호작용

- `RidgeDivider` 자체가 이미 `aria-hidden="true"`, `pointer-events-none`을 최상위 div에 갖고 있음을 원본 컴포넌트에서 확인 — 변경 없음.
- 새로 추가한 `h-0` 래퍼 div는 순수 레이아웃용이며 인터랙티브 요소가 아니다.
- 풋터 내부의 링크/버튼(연락처, 바로가기 등) 최소 터치 타겟, `:focus-visible`, `prefers-reduced-motion` 관련 기존 CSS는 전혀 건드리지 않았다.

## 12. 불확실한 점

- `/gallery`, `/en/gallery` 데스크톱의 저작권 문구 가림(6항) — 보고만 하고 수정하지 않음. 후속 브랜치에서 `pb-8` → `pb-24` 정도로 늘리거나 안내문을 배경 있는 섹션 안으로 옮기는 걸 제안.
- 홈페이지에서는 능선이 완전히 안 보이는 상태(같은 색이라)가 "의도된 정상"인지, 아니면 애초에 stats 섹션과 footer가 다른 색이어야 능선의 시각 효과가 살아나는지는 디자인 판단 영역이라 별도 언급만 하고 손대지 않았다.
