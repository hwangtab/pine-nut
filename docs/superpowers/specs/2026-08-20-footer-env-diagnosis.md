# 풋터 능선 크림색 밴드 버그 — 환경별 진단

조사일: 2026-08-20

## 결론 (Verdict)

**버그는 프로덕션(https://pungcheonri.vercel.app)에만 존재하며, 로컬(http://localhost:3001)에는 존재하지 않는다.**

로컬 저장소에는 이 버그를 고치는 3개 커밋(`1cdfeb5`, `63927d5`, `c45489b`)이 `main`에 있지만 `origin/main`(현재 `db3d46d`)에는 아직 푸시되지 않았다. 즉, 로컬 코드는 이미 수정된 상태이고, Vercel에 배포된 프로덕션은 아직 옛 버전이다. 가설이 그대로 확인되었다.

## 1. 배포 커밋 확인

```
$ git rev-parse origin/main
db3d46d859a2352ade4e94ec7dd7d298b30d98a8

$ git log origin/main..main --oneline
c45489b 푸터 능선 가림 전수 점검: 보도자료 셸·영문 보도자료·공유 페이지 여백 확보 + 갤러리 sm 구간 보정
63927d5 푸터 능선 오버레이가 가리던 하단 콘텐츠 여백 확보 — 갤러리·타임라인·게시판(한/영)
1cdfeb5 풋터 능선(RidgeDivider) flow 배치 → absolute 오버레이로 전환, 배경 이음매 버그 수정
```

프로덕션은 `db3d46d` 기준으로 배포되어 있으므로, 위 3개 수정 커밋을 전혀 반영하지 않은 상태다.

## 2. 마크업 비교 — 결정적 증거

`website/src/components/Footer.tsx` (로컬, 수정 후)의 구조:

```tsx
<footer role="contentinfo" className="relative">
  <div className="relative h-0">
    <RidgeDivider className="absolute -bottom-px left-0 text-[var(--color-deep)]" />
  </div>
  <div className="bg-[var(--color-deep)] text-white">...</div>
</footer>
```

능선 wrapper가 `relative h-0`(레이아웃 공간을 차지하지 않음)이고, 능선 SVG 자체는 `absolute -bottom-px`로 앞 섹션의 어두운 블록 위에 겹쳐 그려진다.

**실제로 브라우저에서 렌더링된 DOM을 비교한 결과:**

- **프로덕션** `/` 및 `/timeline`의 footer 첫 자식(ridge wrapper) class:
  `"w-full overflow-hidden leading-[0] pointer-events-none  text-[var(--color-deep)] -mb-px"`
  → `position: static`, `height: 80px`, `bottom: auto`. 옛(버그) 형태 그대로. footer 자체에는 `relative` 클래스도 없음.

- **로컬** `/` 및 `/timeline`의 footer 첫 자식 class:
  `"relative h-0"` (그 안의 실제 ridge div가 `"...absolute -bottom-px left-0 text-[var(--color-deep)]"`)
  → wrapper는 `position: relative, height: 0px`. 수정된 형태.

이것만으로도 두 환경이 서로 다른 커밋을 서빙하고 있음이 명백하다.

## 3. computed style 측정 (홈 `/`, 1440×900×1)

| 항목 | 프로덕션 | 로컬 |
|---|---|---|
| ridge wrapper `position` | `static` | `relative` |
| ridge wrapper `height` | `80px` | `0px` |
| ridge wrapper `bottom` | `auto` | `0px` (wrapper), 실제 ridge div는 `absolute -bottom-px` |
| ridge wrapper `background-color` | `rgba(0,0,0,0)` | `rgba(0,0,0,0)` |
| footer 바로 위 섹션(통계 밴드) 배경 | `rgb(30,51,23)` (`--color-deep`) | `rgb(30,51,23)` |
| footer 두 번째 자식(어두운 블록) 배경 | `rgb(30,51,23)` | `rgb(30,51,23)` |
| `document.body` 배경 | `rgb(250,247,239)` (크림색) | `rgb(250,247,239)` |

두 환경의 색상 토큰 자체는 동일하다(다 같은 CSS 변수). 차이는 오직 ridge wrapper가 flow에 있는지(프로덕션, 80px 자리를 차지) vs absolute로 겹쳐지는지(로컬, 0px)다.

## 4. 세 번째 색상(크림 밴드) 존재 여부 — 픽셀 샘플링

`elementFromPoint`만으로는 `pointer-events-none`인 ridge 요소를 건너뛰어 실제 페인트 결과를 알 수 없었기 때문에, 스크린샷을 PNG로 저장한 뒤 Python(PIL)으로 정확한 픽셀 색상을 y축을 따라 샘플링했다.

**프로덕션 `/` (x=400, y=280~350):**
```
y=280~310 : (30, 51, 23)   ← 통계 밴드(짙은 녹색)
y=312~346 : (250, 247, 239) ← 크림색 밴드 (버그!)
y=348~    : (30, 51, 23)   ← footer 능선/본체 (짙은 녹색)
```
x=0, 180, 360, 720, 1080 등 다른 x 좌표에서도 동일하게 약 30px 높이의 크림 밴드가 전체 폭에 걸쳐 나타남(파도 정점 부근인 x=180, 1080은 밴드가 약간 짧음 — 파형에 따라 능선이 크림 영역을 파고드는 형태와 일치).

**프로덕션 `/timeline` (x=400, y=280~360):** 밴드 위 섹션이 밝은 배경이라 처음부터 크림/베이지 색이었지만, 능선 직전까지 정확히 `(250,247,239)`(body 배경색)로 수렴한 뒤 짙은 녹색 footer가 시작됨 — 즉 여기서도 능선 위쪽에 여전히 크림 밴드가 낀 채로 렌더링됨.

**로컬 `/` (x=0,180,400,720,1080, y=300~395):** 전 구간 `(30, 51, 23)` 균일 — 크림 밴드 없음. (x=1435는 브라우저 스크롤바 트랙 색상이라 무시.)

**로컬 `/timeline` (x=0,400,720,1080, y=250~400):** 위 섹션의 연한 그라디언트 배경이 자연스럽게 이어지다가 바로 짙은 녹색(30,51,23)으로 전환됨 — 별도의 평평한 크림 스트립 없이 매끄러운 전환.

## 5. 통계 텍스트 비교 (사용자 신고 스크린샷과 대조)

| | 프로덕션 | 로컬 |
|---|---|---|
| 연대 단체 수 | **148개+** | 140개+ |
| 벌목 나무 수 | **11만 +1,999그루** ("잣나무 약 11만 1,999그루 벌목 예정") | 11만+ (정확한 그루 수 텍스트는 "2,256그루" 등 기본 시드값) |

사용자가 신고한 스크린샷의 "148개+", "11만+1,999그루"는 **정확히 프로덕션 값과 일치**한다. 로컬은 `src/data/*` 기본 시드 콘텐츠("140개+", "11만+")를 쓰고 있어 다른 값이 나온다. 이는 사용자가 실제로 관리자 편집된 DB 콘텐츠를 서빙하는 프로덕션을 보고 있었다는 강력한 증거이며, 동시에 프로덕션에서 버그가 재현된다는 이미 확보한 증거와 일치한다.

## 6. 스크린샷 설명

- `prod_footer_boundary.png` (프로덕션 `/`, 1440×900): 육안으로는 짙은 녹색 통계 밴드 → 파도 모양 능선 → 짙은 녹색 footer로 매끄러워 보이지만, 실제로는 통계 밴드와 능선 파형 사이에 약 30px 높이의 크림색 스트립이 전체 폭에 걸쳐 존재한다(픽셀 샘플링으로 확인, 육안으로는 화면 축소·JPEG 압축 탓에 놓치기 쉬움).
- `local_footer_boundary.png` (로컬 `/`, 1440×900): 동일 구도지만 통계 밴드에서 능선을 거쳐 footer 본체까지 완전히 균일한 짙은 녹색. 크림 밴드 없음.
- `prod_timeline_boundary.png` (프로덕션 `/timeline`): 능선 위 섹션이 밝은(크림/베이지) 배경이라 눈에는 잘 안 띄지만, 능선 바로 위에서 정확히 body 배경색(250,247,239)으로 고정된 스트립이 낀 채 footer로 전환됨 — 동일한 버그.
- `local_timeline_boundary.png` (로컬 `/timeline`): 위 섹션의 연한 그라디언트가 자연스럽게 짙은 녹색 footer로 이어짐. 크림 밴드 없음.

(스크린샷 파일은 `docs/superpowers/specs/.diag/`에 임시 저장했으며, 이 진단 작업 전용이므로 필요 없으면 삭제해도 됨.)

## 요약

- 로컬 `main`에 이미 존재하는 3개 미푸시 커밋이 버그를 정확히 고쳤다.
- 프로덕션(Vercel)은 아직 그 이전 커밋(`db3d46d`)을 서빙 중이라 버그가 그대로 남아있다.
- 크림 밴드는 육안으로 놓치기 쉬울 정도로 미묘하지만(약 30px, JPEG 압축 시 더 안 보임), 픽셀 단위로는 명확하게 존재를 확인했다.
- 다음 조치는 (코드 변경 없이 진단만 하라는 지시에 따라 여기서는 실행하지 않았지만) `git push`로 3개 커밋을 `origin/main`에 반영하면 될 것으로 보인다.
