# 국민 연대서명 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 `/petition`(이름·이메일·메시지 3필드 서명)을 홍천 풍천리 양수발전소 백지화 국민 연대서명 페이지로 전면 교체한다 — 7필드 폼, 공개 동의자 명단 벽, 목표 10,000명 진행률, 성명서 전문, FAQ.

**Architecture:** 새 테이블을 파지 않고 기존 `signatures` 테이블에 `region_top`·`region_sub`·`affiliation`·`name_public` 4컬럼을 더한 뒤 데이터를 비운다. 이미 걸린 자산 — 앱/DB 이중 레이트리밋, `anon` 권한 전면 회수 RLS, service_role INSERT 시 동의값 재검증, 관리자 대시보드 — 이 그대로 살아난다. 제출은 기존 `POST /api/signatures`를 확장하고, 명단 벽은 PII를 응답 스키마에서 아예 제외한 별도 `GET /api/signatures/wall`이 커서 페이지네이션으로 담당한다.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Supabase (PostgREST + RLS) · GA4

**Spec:** `docs/superpowers/specs/2026-08-28-solidarity-petition-design.md`

---

## 실행 순서 (번호 순이 아니다)

**Task 1 → 2 → 3 → 4 → 5 → 14 → 15 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 16 → 17**

번호 순으로 실행하면 중간 커밋에서 `npm run build`가 깨진다. 두 지점 때문이다.

- Task 5가 `SignatureFormValues`에 지역 필드를 넣는 순간 **홈 인라인 서명 폼**이 컴파일되지 않는다 → Task 14(홈 인라인 폼 제거)를 Task 5 직후에 실행한다.
- Task 6·8·11이 `english*Copy`·`RecentSignatures`·`usePetitionSignatureSummary`의 옛 필드를 없애는 순간 **`/en/petition`**이 컴파일되지 않는다 → Task 15(영문 페이지 축소)를 그 앞에 실행한다.

Task 14·15는 앞선 Task의 산출물에 의존하지 않으므로 앞당겨도 안전하다.

---

## Global Constraints

이 절의 요구사항은 모든 Task에 암묵적으로 포함된다.

**작업 위치·명령**
- 모든 npm 명령은 `website/` 디렉터리에서 실행한다. 경로 alias `@/*` → `website/src/*`.
- Supabase 마이그레이션은 **CLI로만** 적용한다(MCP 아님): `npx supabase db push`. 프로젝트 ref `hxcoeowfjanltwrsqhyz`.

**테스트 = 가드 스크립트**
- 이 저장소에는 테스트 프레임워크가 없다. `website/scripts/check-*.mjs` 45개가 아키텍처 계약을 강제하며 `npm run <name>:check`로 실행된다. CI는 없다 — 수동 실행이다.
- 이 프로젝트의 TDD는 **가드를 먼저 고쳐 실패시키고 → 구현 → 통과 → 커밋**이다. 순서를 바꾸지 마라.
- 새 가드를 만들면 `package.json`에 npm 스크립트를 반드시 등록한다. 여러 가드가 `package.json`에 자기 스크립트가 있는지 직접 단언한다.

**가드 소유권 (같은 파일을 두 Task가 고치면 서로를 덮어쓴다)**

| 가드 | 소유 Task |
|---|---|
| `check-regions.mjs` (신규) | Task 1 |
| `check-signature-security.mjs` | Task 2(마이그레이션 단언) + Task 4(명단 벽 PII 단언) |
| `check-signatures-api-refactor.mjs` | Task 3(+ Task 4에서 wall 모듈 단언 추가) |
| `check-signature-form-refactor.mjs` | **Task 5** — Task 14는 확인만 한다 |
| `check-petition-copy-refactor.mjs` | Task 6 |
| `check-petition-form-ui-refactor.mjs` | Task 8 |
| `check-petition-signature-form-hook-refactor.mjs` | Task 8 |
| `check-home-cta-refactor.mjs` | Task 14 |
| `check-home-inline-signature-form-refactor.mjs` | Task 14 (**삭제**) |
| `check-petition-refactor.mjs` | Task 15 |
| `usePetitionSignatureSummary.ts` 재작성 | **Task 11** — Task 13은 확인만 한다 |
| `src/app/petition/page.tsx` 조립 · `layout.tsx` JSON-LD | **Task 12** — Task 13은 확인만 한다 |
| `PetitionActionCards.tsx` 삭제 | **Task 13** (그 전에는 어느 페이지든 아직 참조 중이라 지우면 빌드가 깨진다) |

**깨면 안 되는 기존 계약**
- `src/app/api/signatures/route.ts` ≤ 95줄 (`check-signatures-api-refactor.mjs`)
- `src/components/petition/petition-copy.ts` ≤ 8줄, 순수 배럴 (`check-petition-copy-refactor.mjs`)
- `signatures` RLS: `anon` 권한 전면 회수, SELECT는 `signatures_admin_read`가 `is_active_admin()`로 제한, service_role만 SELECT+INSERT (`check-signature-security.mjs`)
- 프로덕션에서 Supabase 미설정 시 fail-closed — 데모 응답 금지 (`check-production-fail-closed.mjs`)

**상수 (정확한 값)**
```ts
SIGNATURE_GOAL = 10000
MESSAGE_MAX_LENGTH = 500        // 기존 100에서 상향
NAME_MAX_LENGTH = 50
AFFILIATION_MAX_LENGTH = 60
REGION_SUB_MAX_LENGTH = 40
WALL_PAGE_SIZE = 30
RATE_LIMIT_WINDOW_MS = 60 * 1000   // 유지
RATE_LIMIT_MAX = 5                 // 유지
OVERSEAS_REGION = "해외"
```

**개인정보**
- `GET /api/signatures/wall` 응답 필드는 `name`·`regionTop`·`regionSub`·`createdAt` **네 개뿐**이다. `email`·`message`·`affiliation`·`ip_hash`는 select 문에도 응답 타입에도 넣지 않는다.
- 명단 벽은 `name_public IS TRUE`인 행만 노출한다.
- 명단은 클라이언트 fetch로만 불러온다(SSR 없음) — 크롤러가 실명을 색인하지 못하게.

**Task 2의 확인 게이트**
- `TRUNCATE signatures`는 되돌릴 수 없다. **백업 CSV의 경로와 행 수를 사용자에게 보고하고 명시적 확인을 받기 전에는 원격 적용을 실행하지 않는다.**

**콘텐츠 — 바꾸면 안 되는 사실·수치**
1937년(숲 조성) · 2017년 산림청 10대 명품숲 · 대한민국 100대 명품숲 · 국내 잣 생산량 62% · 600MW · 나무 111,999그루 · 이미 쓰러진 2,256그루 · 51가구 · 8년째 보전운동 · 왕복효율 약 80%(EIA·NREL) · 산양·수달=멸종위기 Ⅰ급 + 천연기념물 · 담비=멸종위기 Ⅱ급

부처명 표기: 2025년 고시 주체는 **산업통상자원부**, 현재 소관 부처는 **기후에너지환경부**.

**스타일**
- `globals.css`의 색 역할 원칙을 지킨다. `--color-warm`은 **유일한 액션 컬러**로 CTA·서명 버튼 전용이다. `--color-sky`·`--color-earth`는 소형 기능요소 전용(대형 배경 금지). 본문·제목은 `--color-text`/`--color-text-muted`.
- 제목 규칙(`word-break: keep-all`, `line-height: 1.3`, `letter-spacing: -0.02em`, `text-wrap: balance`)은 `@layer base`에 있으므로 유틸리티 클래스로 덮을 수 있다.
- 애니메이션은 CSS 트랜지션으로 충분하다 — 이 페이지에 Framer Motion을 새로 들이지 않는다.

**커밋**
- 커밋 메시지는 한국어, "변경 요약 + 영향 범위" 패턴. 예: `연대서명 지역 선택 컴포넌트 추가 — 시·도 2단 셀렉트와 해외 자유입력`
- 각 Task 끝에서 커밋한다. main 푸시는 Task 17에서 한 번만 한다(Vercel 자동배포).

---
## 1부 — 데이터·API 계층 (Task 1~5)

### Task 1: 지역 데이터 모듈

**Files:**
- Create: `website/src/lib/regions.ts`
- Create: `website/scripts/check-regions.mjs`
- Modify: `website/package.json` (`scripts`에 `"regions:check"` 추가)

**Interfaces:**
- Produces: `OVERSEAS_REGION`, `RegionOption`, `REGIONS`, `REGION_TOPS`, `subsFor(top)`, `isValidRegionPair(top, sub)` — 인터페이스 계약 원문 그대로.

- [ ] **Step 1: 원본 지역 데이터 확인**

  saf-2026의 지역 데이터 파일이 실제로 존재하고 예상한 형태인지 먼저 확인한다.

  Run: `cat /Users/hwang-gyeongha/saf-2026/lib/petition/regions.ts`
  Expected: `RegionSubdivision` 인터페이스(`key`, `label`, `labelEn`, `subs`, `subsEn`)와 `REGIONS: readonly RegionSubdivision[]` 배열, `isValidRegionPair(top, sub)` 함수가 출력된다. 17개 시·도 + `해외` 총 18개 항목이 들어 있고, 각 항목의 `label`은 정식 한글 명칭(예: `서울특별시`), `subs`는 시·군·구 한글 배열이다.

  파일이 없거나 `RegionSubdivision` 형태가 다르면 **대체 절차**를 쓴다: 행정안전부 행정구역 현황(2024년 기준, 강원특별자치도·전북특별자치도 명칭 변경과 대구 군위군 편입 반영)을 기준으로 17개 시·도와 각 시·도의 시·군·구 목록을 직접 조사해 아래와 동일한 `RegionOption[]` 형태로 작성한다. 이 저장소에서는 원본 파일이 확인되었으므로 이하 단계는 원본 복사 경로를 따른다.

- [ ] **Step 2: 변환 절차 — 가드부터 작성해 실패시킨다**

  변환 규칙: saf-2026 각 항목에서 `label`(정식 한글 명칭)을 새 `top` 필드로, `subs`(한글 시·군·구 배열)를 그대로 옮긴다. `key`(축약 키), `labelEn`, `subsEn`은 전부 버린다 — 이 프로젝트의 마이그레이션 CHECK 제약(`signatures_region_top_check`)이 정식 명칭을 값으로 쓰기 때문에 축약 키를 쓰면 DB INSERT가 막힌다. 순서는 원본과 동일하게 서울→...→제주→해외로 유지한다.

  가드 스크립트를 먼저 작성해 `src/lib/regions.ts`가 아직 없는 상태에서 실패하는 것을 확인한다.

  ```js
  // website/scripts/check-regions.mjs
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  const regionsPath = "src/lib/regions.ts";
  assert(existsSync(join(root, regionsPath)), `${regionsPath} must exist.`);

  const source = read(regionsPath);

  for (const required of [
    'export const OVERSEAS_REGION = "해외"',
    "export interface RegionOption",
    "export const REGIONS: RegionOption[]",
    "export const REGION_TOPS: string[]",
    "export function subsFor(top: string): string[]",
    "export function isValidRegionPair(top: string, sub: string): boolean",
  ]) {
    assert(source.includes(required), `regions.ts must contain: ${required}`);
  }

  for (const banned of ["labelEn", "subsEn", "key:", "LocaleCode"]) {
    assert(!source.includes(banned), `regions.ts must not carry English/legacy fields: found ${banned}`);
  }

  const topMatches = source.match(/top:\s*"[^"]+"/g) ?? [];
  assert(
    topMatches.length === 18,
    `REGIONS must contain 17 시·도 + 해외 (18 top entries), found ${topMatches.length}`,
  );

  const REQUIRED_TOPS = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시",
    "울산광역시", "세종특별자치시", "경기도", "강원특별자치도", "충청북도", "충청남도",
    "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도", "해외",
  ];
  for (const top of REQUIRED_TOPS) {
    assert(source.includes(`top: "${top}"`), `REGIONS must include top: "${top}"`);
  }

  assert(
    /top:\s*"해외",\s*subs:\s*\[\s*\]/.test(source),
    '"해외" entry must have an empty subs array — sub는 자유 입력으로 검증한다.',
  );
  assert(
    /top:\s*"세종특별자치시"[\s\S]{0,60}subs:\s*\[\s*\]/.test(source),
    '"세종특별자치시" entry must have an empty subs array (시·군·구 없음).',
  );

  console.log("Regions data checks passed.");
  ```

  Run: `cd website && node scripts/check-regions.mjs`
  Expected: `Error: src/lib/regions.ts must exist.`로 실패한다.

- [ ] **Step 3: package.json에 실행 스크립트 등록**

  ```diff
      "press-doc:refactor:check": "node scripts/check-press-doc-refactor.mjs",
  +   "regions:check": "node scripts/check-regions.mjs",
      "security:check": "node scripts/check-signature-security.mjs",
  ```

  Run: `cd website && npm run regions:check`
  Expected: Step 2와 동일하게 `src/lib/regions.ts must exist.` 실패 — npm 스크립트 경로가 올바르게 연결되었음을 확인한다.

- [ ] **Step 4: `src/lib/regions.ts` 작성**

  saf-2026 원본의 `label`+`subs`만 옮겨 작성한다.

  ```ts
  // website/src/lib/regions.ts
  export const OVERSEAS_REGION = "해외";

  export interface RegionOption {
    top: string;
    subs: string[];
  }

  export const REGIONS: RegionOption[] = [
    {
      top: "서울특별시",
      subs: [
        "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
        "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
        "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
      ],
    },
    {
      top: "부산광역시",
      subs: [
        "강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구",
        "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구",
      ],
    },
    {
      top: "대구광역시",
      subs: ["군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
    },
    {
      top: "인천광역시",
      subs: [
        "강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구",
        "옹진군", "중구",
      ],
    },
    {
      top: "광주광역시",
      subs: ["광산구", "남구", "동구", "북구", "서구"],
    },
    {
      top: "대전광역시",
      subs: ["대덕구", "동구", "서구", "유성구", "중구"],
    },
    {
      top: "울산광역시",
      subs: ["남구", "동구", "북구", "울주군", "중구"],
    },
    {
      top: "세종특별자치시",
      subs: [],
    },
    {
      top: "경기도",
      subs: [
        "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시",
        "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시",
        "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시",
        "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시",
      ],
    },
    {
      top: "강원특별자치도",
      subs: [
        "강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군",
        "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군",
        "화천군", "횡성군",
      ],
    },
    {
      top: "충청북도",
      subs: [
        "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군",
        "진천군", "청주시", "충주시",
      ],
    },
    {
      top: "충청남도",
      subs: [
        "계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시",
        "서천군", "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군",
      ],
    },
    {
      top: "전북특별자치도",
      subs: [
        "고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군",
        "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군",
      ],
    },
    {
      top: "전라남도",
      subs: [
        "강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시",
        "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군",
        "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군",
      ],
    },
    {
      top: "경상북도",
      subs: [
        "경산시", "경주시", "고령군", "구미시", "김천시", "문경시", "봉화군", "상주시",
        "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군",
        "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시",
      ],
    },
    {
      top: "경상남도",
      subs: [
        "거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군",
        "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군",
        "함양군", "합천군",
      ],
    },
    {
      top: "제주특별자치도",
      subs: ["서귀포시", "제주시"],
    },
    {
      top: "해외",
      subs: [],
    },
  ];

  export const REGION_TOPS: string[] = REGIONS.map((region) => region.top);

  const REGION_BY_TOP = new Map(REGIONS.map((region) => [region.top, region] as const));

  export function subsFor(top: string): string[] {
    return REGION_BY_TOP.get(top)?.subs ?? [];
  }

  /**
   * (regionTop, regionSub) 조합 검증.
   * - regionTop은 17개 시·도 + '해외' 중 하나여야 한다.
   * - 시·군·구가 있는 시·도는 regionSub가 그 목록에 있어야 한다.
   * - 시·군·구가 없는 시·도(세종)는 regionSub가 빈 문자열이어야 한다.
   * - '해외'는 시·군·구 목록이 없는 대신 1~40자 자유 입력을 허용한다.
   */
  export function isValidRegionPair(top: string, sub: string): boolean {
    const region = REGION_BY_TOP.get(top);
    if (!region) return false;

    const trimmedSub = sub.trim();

    if (top === OVERSEAS_REGION) {
      return trimmedSub.length >= 1 && trimmedSub.length <= 40;
    }

    if (region.subs.length === 0) {
      return trimmedSub === "";
    }

    return trimmedSub !== "" && region.subs.includes(trimmedSub);
  }
  ```

  Run: `cd website && npm run regions:check`
  Expected: `Regions data checks passed.`

- [ ] **Step 5: 타입 점검 후 커밋**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `src/lib/regions.ts` 관련 에러 없음(다른 미완성 모듈이 있다면 이 파일 관련 라인만 확인).

  Run: `cd website && git add src/lib/regions.ts scripts/check-regions.mjs package.json && git commit -m "$(cat <<'EOF'
  국민 연대서명 지역 데이터 모듈 추가 — 17개 시·도 + 해외 화이트리스트, isValidRegionPair 검증기 신설 + regions:check 가드 도입
  EOF
  )"`
  Expected: 커밋 성공.

---

### Task 2: 마이그레이션 — 백업·확인 게이트·적용

**Files:**
- Create: `website/supabase/migrations/20260828_solidarity_signatures.sql`
- Modify: `website/scripts/check-signature-security.mjs`
- Backup output: `website/supabase/backups/signatures_20260828.sql` (git 추적 대상 아님 — `.gitignore`에 `supabase/backups/`가 없다면 이 커밋에서 추가한다)

**Interfaces:**
- Consumes: 없음 (SQL/CLI 작업).
- Produces: `signatures` 테이블 컬럼 `region_top, region_sub, affiliation, name_public` 및 관련 인덱스·제약. `email` NOT NULL 해제. 기존 서명 데이터 전량 삭제(TRUNCATE).

- [ ] **Step 1: 현재 서명 데이터 백업**

  원격 DB(`hxcoeowfjanltwrsqhyz`)에 연결되어 있는지 먼저 확인하고, `signatures` 테이블 데이터만 SQL 덤프로 로컬에 내려받는다. 별도 백업 스크립트를 새로 만들지 않고 Supabase CLI의 기존 `db dump` 기능을 그대로 쓴다.

  Run: `cd website && npx supabase projects list`
  Expected: `hxcoeowfjanltwrsqhyz`가 목록에 나오고 linked 표시가 있다. linked가 아니면 `npx supabase link --project-ref hxcoeowfjanltwrsqhyz`를 먼저 실행한다.

  Run: `cd website && mkdir -p supabase/backups && npx supabase db dump --linked --data-only -t public.signatures -f supabase/backups/signatures_20260828.sql`
  Expected: `supabase/backups/signatures_20260828.sql` 파일이 생성된다.

  Run: `cd website && grep -c "INSERT INTO" supabase/backups/signatures_20260828.sql`
  Expected: 정수 하나(백업된 행 수)가 출력된다. 이 수치와 파일 경로 `website/supabase/backups/signatures_20260828.sql`를 사용자에게 그대로 보고한다.

  Run: `cd website && grep -qxF "supabase/backups/" .gitignore || echo "supabase/backups/" >> .gitignore`
  Expected: 백업 파일이 실수로 커밋되지 않도록 `.gitignore`에 등록(이미 있으면 아무 것도 추가하지 않음).

- [ ] **Step 2: 🛑 실행 확인 게이트 — 사용자 승인 없이는 다음 단계로 진행하지 않는다**

  > **여기서 반드시 멈춘다.** Step 1에서 보고한 백업 파일 경로와 행 수를 사용자에게 제시하고,
  > "이 마이그레이션은 `TRUNCATE signatures RESTART IDENTITY`를 포함해 현재 서명 데이터를 전량
  > 삭제하며 되돌릴 수 없습니다. 백업은 `website/supabase/backups/signatures_20260828.sql`에
  > N건 저장했습니다. 진행할까요?"라고 명시적으로 묻는다.
  >
  > 사용자가 "네", "진행", "승인" 등 명시적 긍정 응답을 하기 전에는 Step 3 이후(마이그레이션 파일
  > 작성 자체는 로컬 파일이라 무해하지만, **Step 7의 `supabase db push`는 특히 금지**)로 넘어가지
  > 않는다. 응답이 모호하면 다시 확인을 구하고, 거절하면 여기서 작업을 멈추고 백업 파일 경로만
  > 보고한다.

- [ ] **Step 3: 가드 확장 — 신규 마이그레이션 단언 추가 (TDD red)**

  `check-signature-security.mjs`의 기존 단언(anon 정책 회수, `signatures_admin_read`가
  `is_active_admin()` 사용, service_role GRANT 등, 39~94번 줄)은 그대로 둔 채, 파일 맨 끝
  `console.log("Signature security checks passed.");` 바로 앞에 아래 블록을 추가한다.

  ```js
  const solidarityMigrationPath =
    "supabase/migrations/20260828_solidarity_signatures.sql";
  assert(
    existsSync(join(root, solidarityMigrationPath)),
    `${solidarityMigrationPath} must exist.`,
  );

  const solidarityMigration = readProjectFile(solidarityMigrationPath);
  const normalizedSolidaritySql = solidarityMigration
    .toLowerCase()
    .replace(/\s+/g, " ");

  for (const requiredColumn of [
    "add column region_top",
    "add column region_sub",
    "add column affiliation",
    "add column name_public",
  ]) {
    assert(
      normalizedSolidaritySql.includes(requiredColumn),
      `solidarity migration must ${requiredColumn}.`,
    );
  }

  assert(
    normalizedSolidaritySql.includes("alter column email drop not null"),
    "solidarity migration must make email optional.",
  );
  assert(
    normalizedSolidaritySql.includes("truncate signatures restart identity"),
    "solidarity migration must truncate existing signature data after backup.",
  );
  assert(
    /add constraint signatures_region_top_check check \(region_top in \(/.test(
      normalizedSolidaritySql,
    ),
    "solidarity migration must constrain region_top to the known province list.",
  );
  assert(
    normalizedSolidaritySql.includes("'해외'"),
    "solidarity migration's region_top CHECK must include '해외'.",
  );
  assert(
    normalizedSolidaritySql.includes("add constraint signatures_affiliation_len"),
    "solidarity migration must cap affiliation length.",
  );
  assert(
    normalizedSolidaritySql.includes("create unique index idx_signatures_unique_email"),
    "solidarity migration must keep a partial unique index on email.",
  );
  assert(
    normalizedSolidaritySql.includes("create index idx_signatures_wall"),
    "solidarity migration must index the public signature wall query.",
  );
  assert(
    normalizedSolidaritySql.includes("create index idx_signatures_region"),
    "solidarity migration must index region_top for aggregate queries.",
  );
  ```

  `readProjectFile`과 `existsSync`/`join`은 이 파일 상단에서 이미 import되어 있으므로 그대로 쓴다
  (2~5번 줄 참조).

  Run: `cd website && npm run security:check`
  Expected: `Error: supabase/migrations/20260828_solidarity_signatures.sql must exist.`로 실패한다.

- [ ] **Step 4: 마이그레이션 SQL 작성**

  설계 스펙(`docs/superpowers/specs/2026-08-28-solidarity-petition-design.md` 2절)의 SQL을 그대로 옮긴다.

  ```sql
  -- website/supabase/migrations/20260828_solidarity_signatures.sql
  -- 국민 연대서명 전환: 지역·소속·이름 공개 여부 컬럼 추가, 이메일 선택화,
  -- 기존 3필드 서명 데이터 전량 삭제(사전에 CSV/SQL 백업 완료 후 실행).

  ALTER TABLE signatures
    ADD COLUMN region_top   TEXT,
    ADD COLUMN region_sub   TEXT,
    ADD COLUMN affiliation  TEXT,
    ADD COLUMN name_public  BOOLEAN NOT NULL DEFAULT false;

  ALTER TABLE signatures ALTER COLUMN email DROP NOT NULL;

  TRUNCATE signatures RESTART IDENTITY;

  ALTER TABLE signatures
    ALTER COLUMN region_top SET NOT NULL,
    ALTER COLUMN region_sub SET NOT NULL;

  ALTER TABLE signatures
    ADD CONSTRAINT signatures_region_top_check CHECK (region_top IN (
      '서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시',
      '울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도',
      '전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도','해외')),
    ADD CONSTRAINT signatures_affiliation_len  CHECK (affiliation IS NULL OR char_length(affiliation) <= 60);

  DROP INDEX IF EXISTS idx_signatures_unique_normalized_email;
  CREATE UNIQUE INDEX idx_signatures_unique_email
    ON signatures (lower(btrim(email)))
    WHERE email IS NOT NULL AND email <> '';

  CREATE INDEX idx_signatures_wall
    ON signatures (created_at DESC) WHERE name_public IS TRUE;
  CREATE INDEX idx_signatures_region ON signatures (region_top);
  ```

- [ ] **Step 5: 가드 재실행 — 통과 확인 (TDD green)**

  Run: `cd website && npm run security:check`
  Expected: `Signature security checks passed.` — Step 3에서 추가한 신규 단언과 기존 RLS/service_role 단언이 모두 통과한다.

- [ ] **Step 6: 🛑 원격 적용 — Step 2의 승인이 있을 때만 실행**

  > ⚠️ **이 결정은 뒤집혔다** — 기존 서명 65건은 TRUNCATE로 삭제하지 않고 '미상'
  > 센티넬로 백필해 **보존**한다. 따라서 아래 Step 6의 `TRUNCATE` 전제와
  > `grep -c "INSERT INTO"` = `0` 검증은 더 이상 유효하지 않다(보존 후 기대값은
  > 65다). 결정 경위는 `.superpowers/sdd/2026-08-28-solidarity-petition/progress.md`
  > 의 Task 2b 참조.

  > 이 명령은 프로덕션 DB에 `TRUNCATE`를 포함한 마이그레이션을 적용한다. Step 2에서 사용자
  > 승인을 받지 못했다면 이 단계를 실행하지 않는다.

  Run: `cd website && npx supabase db push --linked`
  Expected: `20260828_solidarity_signatures.sql`이 적용되었다는 로그가 출력된다.

  Run: `cd website && npx supabase db dump --linked --data-only -t public.signatures -f /tmp/verify_truncate.sql && grep -c "INSERT INTO" /tmp/verify_truncate.sql`
  Expected: `0` — TRUNCATE로 기존 데이터가 전량 삭제되어 남은 행이 없음을 확인한다(신규 컬럼 NOT NULL 제약 때문에 이 시점 이후에는 새 스키마로만 INSERT 가능).

- [ ] **Step 7: 커밋**

  Run: `cd website && git add supabase/migrations/20260828_solidarity_signatures.sql scripts/check-signature-security.mjs .gitignore && git commit -m "$(cat <<'EOF'
  국민 연대서명 마이그레이션 추가 — signatures에 지역·소속·이름공개 컬럼 신설, 이메일 선택화, 기존 서명 백업 후 삭제 + security 가드에 신규 제약 단언 반영
  EOF
  )"`
  Expected: 커밋 성공. 백업 파일(`supabase/backups/`)은 `.gitignore`로 제외되어 있어 커밋에 포함되지 않는다.

---

### Task 3: 서버 검증·저장 계층

**Files:**
- Modify: `website/src/lib/signatures/api/config.ts`
- Modify: `website/src/lib/signatures/api/validation.ts`
- Modify: `website/src/lib/signatures/api/store.ts`
- Modify: `website/src/lib/signatures/api/demo.ts`
- Modify: `website/src/app/api/signatures/route.ts`
- Modify: `website/scripts/check-signatures-api-refactor.mjs`

**Interfaces:**
- Consumes: `isValidRegionPair`, `OVERSEAS_REGION` from `@/lib/regions` (Task 1).
- Produces: `MESSAGE_MAX_LENGTH`(500), `NAME_MAX_LENGTH`, `AFFILIATION_MAX_LENGTH`, `REGION_SUB_MAX_LENGTH`, `SIGNATURE_GOAL`, `WALL_PAGE_SIZE`, `INVALID_REGION_MESSAGE`, `INVALID_NAME_PUBLIC_MESSAGE`; `SignatureSubmissionBody`, `ValidSignatureSubmission`, `validateSignatureSubmission`; `SignatureSummary`, `fetchSignatureSummary`, `submitSignatureToStore` — 인터페이스 계약 원문 그대로.

**중요한 설계 변경 (계약에 명시된 대로):**
- `submitSignatureToStore`는 더 이상 `SubmitSignatureResult`를 반환하지 않고 `Promise<void>`다. IP 해시는 route.ts에서 미리 계산해 `ipHash` 인자로 넘긴다(기존에는 store.ts 내부에서 `hashIp(ip)`를 호출했다).
- `maskName`은 완전히 삭제한다. 명단 벽이 공개 동의자만 실명을 노출하므로 마스킹이 필요 없다.
- `GET /api/signatures` 응답에서 `signatures[]`(최근 서명 목록)가 사라지고 `regionCount`, `recent24h`, `goal`로 대체된다. 명단은 Task 4의 `/api/signatures/wall`이 전담한다.

- [ ] **Step 1: 가드 확장 — 새 계약 단언 추가 (TDD red)**

  `check-signatures-api-refactor.mjs`의 `configSource`/`validationSource`/`storeSource`/`demoSource` 필수 목록을 계약에 맞게 고친다. 파일 전체를 아래 내용으로 교체한다(기존 모듈 존재 확인·route 길이 제한·route 필수/금지 식별자 목록은 유지하되 store 관련 항목만 바꾼다).

  ```js
  // website/scripts/check-signatures-api-refactor.mjs
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  const routePath = "src/app/api/signatures/route.ts";
  const modulePaths = [
    "src/lib/signatures/api/config.ts",
    "src/lib/signatures/api/request.ts",
    "src/lib/signatures/api/validation.ts",
    "src/lib/signatures/api/demo.ts",
    "src/lib/signatures/api/store.ts",
    "src/lib/signatures/api/responses.ts",
  ];

  for (const modulePath of modulePaths) {
    assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
  }

  const routeSource = read(routePath);
  assert(
    routeSource.trim().split(/\r?\n/).length <= 95,
    "signature route must stay a thin request/response orchestrator.",
  );

  for (const required of [
    "createSupabaseServiceClient",
    "readSignatureRequestBody",
    "validateSignatureSubmission",
    "getDemoSignatureSummary",
    "submitDemoSignature",
    "fetchSignatureSummary",
    "submitSignatureToStore",
    "hashIp",
  ]) {
    assert(routeSource.includes(required), `signature route must use ${required}.`);
  }

  for (const banned of [
    "createHash",
    "DEMO_SIGNATURES",
    "MESSAGE_MAX_LENGTH",
    "devRateLimitMap",
    "maskName",
    ".insert({",
    'select("name, message, created_at")',
    "/^[^\\s@]+@",
  ]) {
    assert(!routeSource.includes(banned), `signature route must not own ${banned}.`);
  }

  const configSource = read("src/lib/signatures/api/config.ts");
  for (const required of [
    "RATE_LIMIT_WINDOW_MS",
    "RATE_LIMIT_MAX",
    "MESSAGE_MAX_LENGTH",
    "IS_PRODUCTION",
    "SERVICE_UNAVAILABLE_MESSAGE",
    "DUPLICATE_SIGNATURE_MESSAGE",
    "NAME_MAX_LENGTH",
    "AFFILIATION_MAX_LENGTH",
    "REGION_SUB_MAX_LENGTH",
    "SIGNATURE_GOAL",
    "WALL_PAGE_SIZE",
    "INVALID_REGION_MESSAGE",
    "INVALID_NAME_PUBLIC_MESSAGE",
  ]) {
    assert(configSource.includes(required), `signatures api config must contain ${required}.`);
  }
  assert(
    configSource.includes("MESSAGE_MAX_LENGTH = 500"),
    "signatures api config must raise MESSAGE_MAX_LENGTH to 500.",
  );

  const validationSource = read("src/lib/signatures/api/validation.ts");
  for (const required of [
    "validateSignatureSubmission",
    "normalizedEmail",
    "messageText",
    "MESSAGE_MAX_LENGTH",
    "agreePrivacy",
    "agreeAge",
    "regionTop",
    "regionSub",
    "namePublic",
    "affiliation",
    "isValidRegionPair",
  ]) {
    assert(validationSource.includes(required), `signatures api validation must contain ${required}.`);
  }

  const demoSource = read("src/lib/signatures/api/demo.ts");
  for (const required of [
    "devRateLimitMap",
    "getDemoSignatureSummary",
    "submitDemoSignature",
    "RATE_LIMIT_MAX",
  ]) {
    assert(demoSource.includes(required), `signatures api demo module must contain ${required}.`);
  }

  const storeSource = read("src/lib/signatures/api/store.ts");
  for (const required of [
    "fetchSignatureSummary",
    "submitSignatureToStore",
    "ip_hash",
    "DUPLICATE_SIGNATURE_MESSAGE",
    "regionCount",
    "recent24h",
  ]) {
    assert(storeSource.includes(required), `signatures api store module must contain ${required}.`);
  }
  assert(
    !storeSource.includes("maskName"),
    "signatures api store module must not mask names — the wall only shows opt-in real names.",
  );

  const responseSource = read("src/lib/signatures/api/responses.ts");
  for (const required of [
    "missingSignatureServiceResponse",
    "signatureApiErrorResponse",
    "SERVICE_UNAVAILABLE_MESSAGE",
    "isMissingSupabaseRelationError",
  ]) {
    assert(responseSource.includes(required), `signatures api responses module must contain ${required}.`);
  }

  console.log("Signatures API refactor checks passed.");
  ```

  Run: `cd website && npm run signatures-api:refactor:check`
  Expected: 실패한다. 예: `Error: signatures api config must contain NAME_MAX_LENGTH.` (기존 `config.ts`에는 아직 없는 상수이므로).

- [ ] **Step 2: `config.ts` 확장**

  ```ts
  // website/src/lib/signatures/api/config.ts
  export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
  export const RATE_LIMIT_MAX = 5;
  export const MESSAGE_MAX_LENGTH = 500;
  export const NAME_MAX_LENGTH = 50;
  export const AFFILIATION_MAX_LENGTH = 60;
  export const REGION_SUB_MAX_LENGTH = 40;
  export const SIGNATURE_GOAL = 10000;
  export const WALL_PAGE_SIZE = 30;
  export const IS_PRODUCTION = process.env.NODE_ENV === "production";

  export const SERVICE_UNAVAILABLE_MESSAGE =
    "서명 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
  export const DUPLICATE_SIGNATURE_MESSAGE = "이미 서명하셨습니다. 참여해주셔서 감사합니다.";
  export const RATE_LIMIT_MESSAGE = "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.";
  export const INVALID_JSON_MESSAGE = "Invalid JSON";
  export const INVALID_REGION_MESSAGE = "거주 지역을 선택해주세요.";
  export const INVALID_NAME_PUBLIC_MESSAGE = "이름 공개 여부를 선택해주세요.";
  export const FETCH_SIGNATURES_ERROR_MESSAGE = "Failed to fetch signatures";
  export const SUBMIT_SIGNATURE_ERROR_MESSAGE = "Failed to submit signature";
  ```

- [ ] **Step 3: `validation.ts` 확장**

  ```ts
  // website/src/lib/signatures/api/validation.ts
  import { isValidRegionPair, OVERSEAS_REGION } from "@/lib/regions";
  import {
    AFFILIATION_MAX_LENGTH,
    INVALID_NAME_PUBLIC_MESSAGE,
    INVALID_REGION_MESSAGE,
    MESSAGE_MAX_LENGTH,
    NAME_MAX_LENGTH,
  } from "./config";

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  export interface SignatureSubmissionBody {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    regionTop?: unknown;
    regionSub?: unknown;
    affiliation?: unknown;
    namePublic?: unknown;
    agreePrivacy?: unknown;
    agreeAge?: unknown;
  }

  export interface ValidSignatureSubmission {
    name: string;
    email: string | null;
    normalizedEmail: string | null;
    messageText: string;
    regionTop: string;
    regionSub: string;
    affiliation: string | null;
    namePublic: boolean;
    agreePrivacy: true;
    agreeAge: true;
  }

  interface SignatureSubmissionValidationError {
    ok: false;
    error: string;
    status: 400;
  }

  interface SignatureSubmissionValidationSuccess {
    ok: true;
    value: ValidSignatureSubmission;
  }

  type SignatureSubmissionValidationResult =
    | SignatureSubmissionValidationError
    | SignatureSubmissionValidationSuccess;

  function validationError(error: string): SignatureSubmissionValidationError {
    return { ok: false, error, status: 400 };
  }

  function asOptionalString(value: unknown): string | undefined {
    return value === undefined || value === null || typeof value === "string"
      ? value ?? ""
      : undefined;
  }

  export function validateSignatureSubmission(
    body: SignatureSubmissionBody,
  ): SignatureSubmissionValidationResult {
    const name = asOptionalString(body.name);
    if (!name?.trim()) {
      return validationError("이름을 입력해주세요.");
    }
    if (name.trim().length > NAME_MAX_LENGTH) {
      return validationError("이름이 너무 깁니다.");
    }

    const regionTop = asOptionalString(body.regionTop)?.trim() ?? "";
    const regionSub = asOptionalString(body.regionSub)?.trim() ?? "";
    if (!regionTop || !isValidRegionPair(regionTop, regionSub)) {
      return validationError(INVALID_REGION_MESSAGE);
    }

    const affiliationText = asOptionalString(body.affiliation)?.trim() ?? "";
    if (affiliationText.length > AFFILIATION_MAX_LENGTH) {
      return validationError(`소속은 ${AFFILIATION_MAX_LENGTH}자 이내로 입력해주세요.`);
    }

    const emailText = asOptionalString(body.email)?.trim() ?? "";
    if (emailText && !EMAIL_PATTERN.test(emailText)) {
      return validationError("올바른 이메일을 입력해주세요.");
    }

    const message = asOptionalString(body.message);
    if (message === undefined || message.length > MESSAGE_MAX_LENGTH) {
      return validationError(`메시지는 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.`);
    }

    if (typeof body.namePublic !== "boolean") {
      return validationError(INVALID_NAME_PUBLIC_MESSAGE);
    }

    if (body.agreePrivacy !== true) {
      return validationError("개인정보 수집·이용 동의가 필요합니다.");
    }
    if (body.agreeAge !== true) {
      return validationError("만 14세 이상 확인이 필요합니다.");
    }

    // OVERSEAS_REGION은 자유 입력 sub를 그대로 쓴다 — 화이트리스트 매칭이 없다.
    void OVERSEAS_REGION;

    return {
      ok: true,
      value: {
        name: name.trim(),
        email: emailText ? emailText : null,
        normalizedEmail: emailText ? emailText.toLowerCase() : null,
        messageText: message.trim(),
        regionTop,
        regionSub,
        affiliation: affiliationText ? affiliationText : null,
        namePublic: body.namePublic,
        agreePrivacy: true,
        agreeAge: true,
      },
    };
  }
  ```

  `void OVERSEAS_REGION;` 줄은 import를 실제로 쓰는 흔적을 남기기 위한 자리표시일 뿐이다 — 실제로는
  `isValidRegionPair`가 내부적으로 해외 분기를 처리하므로 이 줄은 지워도 되지만, 가드가 요구하는
  식별자 존재 여부와 무관하게 lint의 미사용 import 경고를 피하려면 실제로 `OVERSEAS_REGION`을 쓰지
  않는 편이 낫다 — **이 줄은 삭제하고 `import { isValidRegionPair, OVERSEAS_REGION } from "@/lib/regions";`를
  `import { isValidRegionPair } from "@/lib/regions";`로 줄여라.** (가드 조건에는 영향 없음.)

- [ ] **Step 4: `store.ts` 확장 — `maskName` 삭제, `SignatureSummary`/`submitSignatureToStore` 계약 변경**

  ```ts
  // website/src/lib/signatures/api/store.ts
  import type { SupabaseClient } from "@supabase/supabase-js";
  import { DUPLICATE_SIGNATURE_MESSAGE, RATE_LIMIT_MAX, RATE_LIMIT_MESSAGE, RATE_LIMIT_WINDOW_MS, SIGNATURE_GOAL } from "./config";
  import { SignatureApiError } from "./responses";
  import type { ValidSignatureSubmission } from "./validation";

  export interface SignatureSummary {
    count: number;
    regionCount: number;
    recent24h: number;
    goal: number;
  }

  export async function fetchSignatureSummary(
    supabase: SupabaseClient,
  ): Promise<SignatureSummary> {
    const { count, error: countError } = await supabase
      .from("signatures")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    const { data: regionRows, error: regionError } = await supabase
      .from("signatures")
      .select("region_top");

    if (regionError) throw regionError;

    const regionCount = new Set(
      (regionRows || [])
        .map((row: { region_top: string | null }) => row.region_top)
        .filter((value: string | null): value is string => Boolean(value)),
    ).size;

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recent24h, error: recentError } = await supabase
      .from("signatures")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayAgo);

    if (recentError) throw recentError;

    return {
      count: count || 0,
      regionCount,
      recent24h: recent24h || 0,
      goal: SIGNATURE_GOAL,
    };
  }

  export async function submitSignatureToStore(
    supabase: SupabaseClient,
    value: ValidSignatureSubmission,
    ipHash: string,
  ): Promise<void> {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count: recentCount, error: rateLimitError } = await supabase
      .from("signatures")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart);

    if (rateLimitError) throw rateLimitError;

    if ((recentCount || 0) >= RATE_LIMIT_MAX) {
      throw new SignatureApiError(RATE_LIMIT_MESSAGE, 429);
    }

    const { error: insertError } = await supabase.from("signatures").insert({
      name: value.name,
      email: value.normalizedEmail,
      message: value.messageText,
      region_top: value.regionTop,
      region_sub: value.regionSub,
      affiliation: value.affiliation,
      name_public: value.namePublic,
      ip_hash: ipHash,
      consent_privacy: value.agreePrivacy,
      consent_age: value.agreeAge,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        throw new SignatureApiError(DUPLICATE_SIGNATURE_MESSAGE, 409);
      }
      if (
        insertError.code === "P0001" &&
        insertError.message.includes("rate_limit_exceeded")
      ) {
        throw new SignatureApiError(RATE_LIMIT_MESSAGE, 429);
      }
      throw insertError;
    }
  }
  ```

  `maskName` 함수와 그 호출부는 통째로 삭제됐다 — 이전에는 `fetchSignatureSummary`가 최근 서명
  10건을 마스킹된 이름과 함께 반환했지만, 이제 그 책임은 Task 4의 `fetchSignatureWall`로 완전히
  옮겨갔고 `fetchSignatureSummary`는 집계 수치만 돌려준다.

- [ ] **Step 5: `demo.ts` 축소 — 신규 필드 반영**

  ```ts
  // website/src/lib/signatures/api/demo.ts
  import { RATE_LIMIT_MAX, RATE_LIMIT_MESSAGE, RATE_LIMIT_WINDOW_MS, SIGNATURE_GOAL } from "./config";
  import type { SignatureSummary } from "./store";

  interface DemoRateLimitEntry {
    count: number;
    resetAt: number;
  }

  interface DemoSignatureSubmitSuccess {
    ok: true;
  }

  interface DemoSignatureSubmitError {
    ok: false;
    error: string;
    status: 429;
  }

  const devRateLimitMap = new Map<string, DemoRateLimitEntry>();

  function isRateLimitedInDemoMode(ip: string): boolean {
    const now = Date.now();
    const entry = devRateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
      devRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return false;
    }
    entry.count += 1;
    return entry.count > RATE_LIMIT_MAX;
  }

  export function getDemoSignatureSummary(): SignatureSummary {
    return {
      count: 2847,
      regionCount: 17,
      recent24h: 42,
      goal: SIGNATURE_GOAL,
    };
  }

  export function submitDemoSignature(
    ip: string,
  ): DemoSignatureSubmitSuccess | DemoSignatureSubmitError {
    if (isRateLimitedInDemoMode(ip)) {
      return { ok: false, error: RATE_LIMIT_MESSAGE, status: 429 };
    }

    return { ok: true };
  }
  ```

  `DEMO_SIGNATURES`(이름+메시지 목록)는 삭제됐다 — GET 요약 응답에 더 이상 최근 서명 목록이
  없으므로 쓸 데가 없다. Task 4의 명단 벽 데모 폴백은 `wall.ts`/wall route에서 별도로, 이 모듈에
  기대지 않고 자체적으로 마련한다(순서상 Task 4가 이 모듈을 아직 참조할 수 없기 때문).

- [ ] **Step 6: `route.ts` 갱신 — 95줄 이하 유지**

  ```ts
  // website/src/app/api/signatures/route.ts
  import { NextRequest, NextResponse } from "next/server";
  import { getDemoSignatureSummary, submitDemoSignature } from "@/lib/signatures/api/demo";
  import {
    FETCH_SIGNATURES_ERROR_MESSAGE,
    INVALID_JSON_MESSAGE,
    IS_PRODUCTION,
    SUBMIT_SIGNATURE_ERROR_MESSAGE,
  } from "@/lib/signatures/api/config";
  import {
    getClientIp,
    hashIp,
    readSignatureRequestBody,
  } from "@/lib/signatures/api/request";
  import {
    jsonErrorResponse,
    missingSignatureServiceResponse,
    signatureApiErrorResponse,
  } from "@/lib/signatures/api/responses";
  import {
    fetchSignatureSummary,
    submitSignatureToStore,
  } from "@/lib/signatures/api/store";
  import { validateSignatureSubmission } from "@/lib/signatures/api/validation";
  import { createSupabaseServiceClient } from "@/lib/supabase-service";

  export async function GET() {
    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      if (IS_PRODUCTION) return missingSignatureServiceResponse();
      return NextResponse.json(getDemoSignatureSummary());
    }

    try {
      return NextResponse.json(await fetchSignatureSummary(supabase));
    } catch (error) {
      return signatureApiErrorResponse(
        "Failed to fetch signatures:",
        error,
        FETCH_SIGNATURES_ERROR_MESSAGE,
      );
    }
  }

  export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    const body = await readSignatureRequestBody(request);

    if (!body.ok) {
      return jsonErrorResponse(INVALID_JSON_MESSAGE, 400);
    }

    const validation = validateSignatureSubmission(body.body);
    if (!validation.ok) {
      return jsonErrorResponse(validation.error, validation.status);
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      if (IS_PRODUCTION) return missingSignatureServiceResponse();
      const demoResult = submitDemoSignature(ip);
      return demoResult.ok
        ? NextResponse.json({ success: true })
        : jsonErrorResponse(demoResult.error, demoResult.status);
    }

    try {
      await submitSignatureToStore(supabase, validation.value, hashIp(ip));
      return NextResponse.json({ success: true });
    } catch (error) {
      return signatureApiErrorResponse(
        "Failed to submit signature:",
        error,
        SUBMIT_SIGNATURE_ERROR_MESSAGE,
      );
    }
  }
  ```

  이 파일은 63줄이다 — 95줄 상한 안에 여유 있게 들어온다. `hashIp`는 기존 `request.ts`가 이미
  export하고 있으므로(수정 불필요) route.ts가 직접 `createHash`를 쓰지 않으면서도 IP를 해시할 수
  있다.

- [ ] **Step 7: 가드 재실행 — 통과 확인 (TDD green)**

  Run: `cd website && npm run signatures-api:refactor:check`
  Expected: `Signatures API refactor checks passed.`

  Run: `cd website && npm run security:check`
  Expected: `Signature security checks passed.` — route.ts가 여전히 `createSupabaseServiceClient`만 쓰고 `@/lib/supabase`(anon 클라이언트)를 쓰지 않는지 재확인한다.

- [ ] **Step 8: 타입 점검 후 커밋**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `src/lib/signatures/api/*`, `src/app/api/signatures/route.ts` 관련 에러 없음. (`src/lib/signatures/client.ts`, `form.ts`, `PetitionSignatureForm.tsx` 등 Task 5 이후 또는 다른 조각에서 다루는 파일의 타입 불일치는 이 시점에는 남아 있을 수 있다 — 이 Task의 완료 기준이 아니다.)

  Run: `cd website && git add src/lib/signatures/api/config.ts src/lib/signatures/api/validation.ts src/lib/signatures/api/store.ts src/lib/signatures/api/demo.ts src/app/api/signatures/route.ts scripts/check-signatures-api-refactor.mjs && git commit -m "$(cat <<'EOF'
  서명 API 검증·저장 계층에 지역·소속·이름공개 필드 반영 — 이메일 선택화, 메시지 500자 상향, maskName 제거(명단 벽이 공개 동의자만 실명 노출) + signatures-api 가드 계약 갱신
  EOF
  )"`
  Expected: 커밋 성공.

---

### Task 4: 명단 벽 API

**Files:**
- Create: `website/src/lib/signatures/api/wall.ts`
- Create: `website/src/app/api/signatures/wall/route.ts`
- Modify: `website/scripts/check-signature-security.mjs`

**Interfaces:**
- Consumes: `WALL_PAGE_SIZE`, `IS_PRODUCTION` from `./config`; `missingSignatureServiceResponse`, `signatureApiErrorResponse` from `./responses`; `createSupabaseServiceClient`.
- Produces: `WallEntry`, `WallPage`, `fetchSignatureWall(supabase, cursor)` — 인터페이스 계약 원문 그대로.

- [ ] **Step 1: 가드 확장 — email/message/affiliation/ip_hash 비노출 단언 추가 (TDD red)**

  `check-signature-security.mjs`의 `console.log("Signature security checks passed.");` 바로 앞에
  (Task 2에서 추가한 마이그레이션 단언 블록 뒤에) 아래를 추가한다.

  ```js
  const wallModulePath = "src/lib/signatures/api/wall.ts";
  assert(existsSync(join(root, wallModulePath)), `${wallModulePath} must exist.`);

  const wallModule = readProjectFile(wallModulePath);
  for (const forbiddenField of ["email", "message", "affiliation", "ip_hash"]) {
    assert(
      !wallModule.includes(forbiddenField),
      `signature wall module must not select ${forbiddenField}.`,
    );
  }
  assert(
    wallModule.includes('.eq("name_public", true)'),
    "signature wall module must filter to name_public rows only.",
  );

  const wallRoutePath = "src/app/api/signatures/wall/route.ts";
  assert(existsSync(join(root, wallRoutePath)), `${wallRoutePath} must exist.`);

  const wallRoute = readProjectFile(wallRoutePath);
  for (const forbiddenField of ["email", "message", "affiliation", "ip_hash"]) {
    assert(
      !wallRoute.includes(forbiddenField),
      `signature wall route must not expose ${forbiddenField}.`,
    );
  }
  assert(
    !/from\s+["']@\/lib\/supabase["']/.test(wallRoute),
    "signature wall route must not use the public anon Supabase client.",
  );
  assert(
    wallRoute.includes("createSupabaseServiceClient"),
    "signature wall route must use the server-only service-role client.",
  );
  ```

  `existsSync`, `join`, `readProjectFile`은 파일 상단에 이미 있으므로 재사용한다.

  Run: `cd website && npm run security:check`
  Expected: `Error: src/lib/signatures/api/wall.ts must exist.`로 실패한다.

- [ ] **Step 2: `wall.ts` 작성**

  ```ts
  // website/src/lib/signatures/api/wall.ts
  import type { SupabaseClient } from "@supabase/supabase-js";
  import { WALL_PAGE_SIZE } from "./config";

  export interface WallEntry {
    name: string;
    regionTop: string;
    regionSub: string;
    createdAt: string;
  }

  export interface WallPage {
    entries: WallEntry[];
    nextCursor: string | null;
  }

  interface WallRow {
    name: string;
    region_top: string;
    region_sub: string;
    created_at: string;
  }

  export async function fetchSignatureWall(
    supabase: SupabaseClient,
    cursor: string | null,
  ): Promise<WallPage> {
    let query = supabase
      .from("signatures")
      .select("name, region_top, region_sub, created_at")
      .eq("name_public", true)
      .order("created_at", { ascending: false })
      .limit(WALL_PAGE_SIZE + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []) as WallRow[];
    const hasMore = rows.length > WALL_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, WALL_PAGE_SIZE) : rows;

    return {
      entries: page.map((row) => ({
        name: row.name,
        regionTop: row.region_top,
        regionSub: row.region_sub,
        createdAt: row.created_at,
      })),
      nextCursor: hasMore ? page[page.length - 1].created_at : null,
    };
  }
  ```

  `select()`에는 `name, region_top, region_sub, created_at` 네 컬럼만 나열한다 — `email`,
  `message`, `affiliation`, `ip_hash`는 이 함수 어디에도 등장하지 않는다.

- [ ] **Step 3: wall API 라우트 작성**

  Task 3의 `route.ts`와 동일하게 `IS_PRODUCTION` 게이트를 따르되, 데모 데이터는 이 파일 안에
  자체적으로 둔다(Task 3의 `demo.ts`를 참조하지 않는다 — 그쪽에는 명단 벽용 데이터가 없다).

  ```ts
  // website/src/app/api/signatures/wall/route.ts
  import { NextRequest, NextResponse } from "next/server";
  import { IS_PRODUCTION } from "@/lib/signatures/api/config";
  import {
    missingSignatureServiceResponse,
    signatureApiErrorResponse,
  } from "@/lib/signatures/api/responses";
  import { fetchSignatureWall, type WallPage } from "@/lib/signatures/api/wall";
  import { createSupabaseServiceClient } from "@/lib/supabase-service";

  const DEMO_WALL_PAGE: WallPage = {
    entries: [
      { name: "김도현", regionTop: "강원특별자치도", regionSub: "홍천군", createdAt: "2026-08-27T09:00:00Z" },
      { name: "박서연", regionTop: "서울특별시", regionSub: "마포구", createdAt: "2026-08-27T08:30:00Z" },
      { name: "이준호", regionTop: "경기도", regionSub: "수원시", createdAt: "2026-08-26T21:10:00Z" },
    ],
    nextCursor: null,
  };

  export async function GET(request: NextRequest) {
    const cursor = request.nextUrl.searchParams.get("cursor");
    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      if (IS_PRODUCTION) return missingSignatureServiceResponse();
      return NextResponse.json(DEMO_WALL_PAGE);
    }

    try {
      return NextResponse.json(await fetchSignatureWall(supabase, cursor));
    } catch (error) {
      return signatureApiErrorResponse(
        "Failed to fetch signature wall:",
        error,
        "Failed to fetch signature wall",
      );
    }
  }
  ```

- [ ] **Step 4: 가드 재실행 — 통과 확인 (TDD green)**

  Run: `cd website && npm run security:check`
  Expected: `Signature security checks passed.`

- [ ] **Step 5: 타입 점검 후 커밋**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `src/lib/signatures/api/wall.ts`, `src/app/api/signatures/wall/route.ts` 관련 에러 없음.

  Run: `cd website && git add src/lib/signatures/api/wall.ts src/app/api/signatures/wall/route.ts scripts/check-signature-security.mjs && git commit -m "$(cat <<'EOF'
  명단 벽 API 신설 — name_public 동의자만 name/regionTop/regionSub/createdAt 4필드로 커서 페이지네이션 제공 + security 가드에 email·message·affiliation·ip_hash 비노출 단언 추가
  EOF
  )"`
  Expected: 커밋 성공.

---

### Task 5: 클라이언트 제출 계층

**Files:**
- Modify: `website/src/lib/signatures/client.ts`
- Modify: `website/src/lib/signatures/form.ts`
- Modify: `website/scripts/check-signature-form-refactor.mjs`

**Interfaces:**
- Consumes: `SignatureSummary` from `@/lib/signatures/api/store` (Task 3); `WallEntry`, `WallPage` from `@/lib/signatures/api/wall` (Task 4); `isValidRegionPair` from `@/lib/regions` (Task 1).
- Produces: `SignaturePayload`, `submitSignature`, `fetchSignatureSummary`, `fetchSignatureWall` (client.ts); `SignatureFormValues`, `SignatureFormErrors`, `validateSignatureForm`, `submitSignatureForm` (form.ts) — 인터페이스 계약 원문 그대로.

**중요한 설계 변경 (계약에 명시된 대로, 다른 조각의 UI 컴포넌트 작업에 영향):**
- `submitSignature`는 더 이상 예외를 던지지 않고 `{ok:true}|{ok:false,error}`를 반환한다.
- `validateSignatureForm`은 기존 `{valid, errors}` 래퍼 대신 `SignatureFormErrors` 객체를 바로 반환한다(비어 있으면 유효).
- `submitSignatureForm`도 `{name, count}` 대신 `submitSignature`와 동일한 `{ok:true}|{ok:false,error}` 형태를 반환한다.
- 이 Task는 `client.ts`/`form.ts`만 다룬다. `PetitionSignatureForm.tsx`/`usePetitionSignatureForm.ts`(폼 UI)는 이 계약 변경에 맞춰 별도 Task(플랜의 다른 조각, 6번대)에서 조정된다 — 이 Task 완료 시점에 `npm run build`가 그 컴포넌트 때문에 실패할 수 있으나, 이 Task의 완료 기준은 아래 가드 통과다.

- [ ] **Step 1: 가드 재작성 — 홈 인라인 폼 번들 검사 제거, petition 번들에 신규 필드 요구 추가 (TDD red)**

  `HomeInlineSignatureForm` 관련 검사를 완전히 들어낸다(그 컴포넌트 자체의 삭제는 이 Task의 일이
  아니다 — Task 13에서 별도로 처리되므로, 여기서 "삭제되어 있어야 한다"는 단언은 추가하지
  않는다). 대신 petition 번들에 지역·이름공개 필드가 실제로 다뤄지는지 확인하는 단언을 추가한다.

  ```js
  // website/scripts/check-signature-form-refactor.mjs
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  const sharedPath = "src/lib/signatures/form.ts";
  assert(existsSync(join(root, sharedPath)), "shared signature form helpers must exist.");

  const sharedSource = read(sharedPath);
  for (const exportName of [
    "validateSignatureForm",
    "submitSignatureForm",
    "SignatureFormErrors",
    "SignatureFormValues",
  ]) {
    assert(sharedSource.includes(exportName), `signature form helpers must export ${exportName}.`);
  }
  assert(
    sharedSource.includes("regionTop"),
    "signature form helpers must validate regionTop for the solidarity petition.",
  );
  assert(
    sharedSource.includes("namePublic"),
    "signature form helpers must validate namePublic for the solidarity petition.",
  );

  const petitionSource = [
    read("src/components/petition/PetitionSignatureForm.tsx"),
    read("src/components/petition/signature-form/usePetitionSignatureForm.ts"),
  ].join("\n");

  assert(
    petitionSource.includes("@/lib/signatures/form"),
    "PetitionSignatureForm must use shared signature form helpers.",
  );
  assert(
    petitionSource.includes("validateSignatureForm"),
    "PetitionSignatureForm must validate through shared signature form helpers.",
  );
  assert(
    petitionSource.includes("submitSignatureForm"),
    "PetitionSignatureForm must submit through shared signature form helpers.",
  );
  assert(
    !petitionSource.includes("@/lib/signatures/client"),
    "PetitionSignatureForm must not import signature client primitives directly.",
  );
  assert(!petitionSource.includes("isValidEmail"), "PetitionSignatureForm must not duplicate email validation.");
  assert(!petitionSource.includes("submitSignature("), "PetitionSignatureForm must not call submitSignature directly.");

  console.log("Signature form refactor checks passed.");
  ```

  Run: `cd website && npm run signature-form:refactor:check`
  Expected: `Error: signature form helpers must validate regionTop for the solidarity petition.`로 실패한다(기존 `form.ts`에는 `regionTop`이 없으므로).

- [ ] **Step 2: `client.ts` 재작성**

  ```ts
  // website/src/lib/signatures/client.ts
  export type { SignatureSummary } from "@/lib/signatures/api/store";
  export type { WallEntry, WallPage } from "@/lib/signatures/api/wall";

  import type { SignatureSummary } from "@/lib/signatures/api/store";
  import type { WallPage } from "@/lib/signatures/api/wall";

  export interface SignaturePayload {
    name: string;
    email: string;
    message: string;
    regionTop: string;
    regionSub: string;
    affiliation: string;
    namePublic: boolean;
    agreePrivacy: boolean;
    agreeAge: boolean;
  }

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  export function isValidEmail(value: string): boolean {
    return EMAIL_PATTERN.test(value);
  }

  async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
    const data = await response.json().catch(() => null);
    return data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error
      : fallback;
  }

  export async function submitSignature(
    payload: SignaturePayload,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const response = await fetch("/api/signatures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, error: await readApiErrorMessage(response, "서명 제출에 실패했습니다.") };
    }

    return { ok: true };
  }

  export async function fetchSignatureSummary(): Promise<SignatureSummary> {
    const response = await fetch("/api/signatures");
    if (!response.ok) {
      throw new Error(await readApiErrorMessage(response, "서명 현황을 불러오지 못했습니다."));
    }

    const data = await response.json();
    return {
      count: typeof data.count === "number" ? data.count : 0,
      regionCount: typeof data.regionCount === "number" ? data.regionCount : 0,
      recent24h: typeof data.recent24h === "number" ? data.recent24h : 0,
      goal: typeof data.goal === "number" ? data.goal : 0,
    };
  }

  export async function fetchSignatureWall(cursor: string | null = null): Promise<WallPage> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    const response = await fetch(`/api/signatures/wall${query}`);
    if (!response.ok) {
      throw new Error(await readApiErrorMessage(response, "명단을 불러오지 못했습니다."));
    }

    const data = await response.json();
    return {
      entries: Array.isArray(data.entries) ? data.entries : [],
      nextCursor: typeof data.nextCursor === "string" ? data.nextCursor : null,
    };
  }
  ```

  `SignatureSummary`/`WallEntry`/`WallPage`는 여기서 새로 정의하지 않고 `api/store.ts`,
  `api/wall.ts`에서 타입만 재수출한다(`export type { ... } from ...`). TypeScript의 `import
  type`/`export type`은 컴파일 시 완전히 지워지므로, 서버 전용 모듈(`@supabase/supabase-js` 등을
  참조하는 store.ts/wall.ts)의 런타임 코드가 브라우저 번들에 섞여 들어가지 않는다 — 타입 선언만
  가져온다.

  `SubmitSignatureInput`, `SubmitSignatureResult`, `PublicSignature` 같은 옛 인터페이스는 전부
  삭제됐다.

- [ ] **Step 3: `form.ts` 재작성**

  ```ts
  // website/src/lib/signatures/form.ts
  import { isValidRegionPair } from "@/lib/regions";
  import {
    submitSignature,
    type SignaturePayload,
  } from "@/lib/signatures/client";

  export interface SignatureFormValues {
    name: string;
    email: string;
    message: string;
    regionTop: string;
    regionSub: string;
    affiliation: string;
    namePublic: boolean | null;
    agreePrivacy: boolean;
    agreeAge: boolean;
  }

  export interface SignatureFormErrors {
    name?: string;
    email?: string;
    message?: string;
    region?: string;
    affiliation?: string;
    namePublic?: string;
    agreePrivacy?: string;
    agreeAge?: string;
  }

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_MAX_LENGTH = 50;
  const AFFILIATION_MAX_LENGTH = 60;
  const MESSAGE_MAX_LENGTH = 500;

  export function validateSignatureForm(values: SignatureFormValues): SignatureFormErrors {
    const errors: SignatureFormErrors = {};

    const name = values.name.trim();
    if (!name) {
      errors.name = "이름 또는 닉네임을 입력해주세요.";
    } else if (name.length > NAME_MAX_LENGTH) {
      errors.name = "이름이 너무 깁니다.";
    }

    if (!values.regionTop || !isValidRegionPair(values.regionTop, values.regionSub)) {
      errors.region = "거주 지역을 선택해주세요.";
    }

    if (values.affiliation.trim().length > AFFILIATION_MAX_LENGTH) {
      errors.affiliation = `소속은 ${AFFILIATION_MAX_LENGTH}자 이내로 입력해주세요.`;
    }

    const email = values.email.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      errors.email = "올바른 이메일을 입력해주세요.";
    }

    if (values.message.length > MESSAGE_MAX_LENGTH) {
      errors.message = `제안은 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.`;
    }

    if (values.namePublic === null) {
      errors.namePublic = "이름 공개 여부를 선택해주세요.";
    }

    if (!values.agreePrivacy) {
      errors.agreePrivacy = "개인정보 수집·이용 동의가 필요합니다.";
    }

    if (!values.agreeAge) {
      errors.agreeAge = "만 14세 이상만 서명할 수 있습니다.";
    }

    return errors;
  }

  function toSignaturePayload(values: SignatureFormValues): SignaturePayload {
    return {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      regionTop: values.regionTop,
      regionSub: values.regionSub.trim(),
      affiliation: values.affiliation.trim(),
      namePublic: values.namePublic === true,
      agreePrivacy: values.agreePrivacy,
      agreeAge: values.agreeAge,
    };
  }

  export async function submitSignatureForm(
    values: SignatureFormValues,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const errors = validateSignatureForm(values);
    if (Object.keys(errors).length > 0) {
      return { ok: false, error: "입력값을 다시 확인해주세요." };
    }

    return submitSignature(toSignaturePayload(values));
  }
  ```

- [ ] **Step 4: 가드 재실행 — 통과 확인 (TDD green)**

  Run: `cd website && npm run signature-form:refactor:check`
  Expected: petition 번들 관련 단언은 그대로 통과하되(기존 `PetitionSignatureForm.tsx`가 여전히
  `@/lib/signatures/form`을 통해 검증·제출하는 구조 자체는 안 바뀌었으므로), `regionTop`/`namePublic`
  단언은 `form.ts`가 이제 두 식별자를 포함하므로 통과한다. 전체 출력은
  `Signature form refactor checks passed.`

  참고: `npm run home-inline-signature:refactor:check`(Task 13 이전까지 유효한 별도 가드)는 이
  Task에서 손대지 않았으므로 계속 독립적으로 동작한다 — `HomeInlineSignatureForm.tsx`가 아직
  `@/lib/signatures/form`의 옛 반환 형태(`{valid, errors}`, `{name, count}`)를 기대하고 있다면
  타입 에러가 나거나 런타임에서 어긋날 수 있다. 이 파일의 수정은 Task 13의 책임이다.

- [ ] **Step 5: 타입 점검 후 커밋**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `src/lib/signatures/client.ts`, `src/lib/signatures/form.ts` 자체에는 에러가 없다.
  `PetitionSignatureForm.tsx`, `HomeInlineSignatureForm.tsx` 등 이 계약을 소비하는 컴포넌트
  쪽에서 `validateSignatureForm`/`submitSignatureForm`의 옛 반환 형태를 기대하는 타입 에러가
  나타날 수 있다 — 그건 이 Task가 아니라 폼 UI를 다루는 다른 Task(6번대, 13번)의 몫이다. 이
  Task는 `client.ts`/`form.ts` 자체의 타입 정합성과 가드 통과만 책임진다.

  Run: `cd website && git add src/lib/signatures/client.ts src/lib/signatures/form.ts scripts/check-signature-form-refactor.mjs && git commit -m "$(cat <<'EOF'
  서명 클라이언트·폼 헬퍼에 지역·소속·이름공개 필드 반영 — submitSignature/submitSignatureForm을 예외 대신 결과값 반환으로 전환, fetchSignatureWall 추가 + 가드에서 홈 인라인 폼 번들 검사 제거
  EOF
  )"`
  Expected: 커밋 성공.
## 2부 — UI 계층 (Task 6~12)

> **실행 순서 주의 — 이 부에 들어오기 전에 Task 14·15가 끝나 있어야 한다.**
> Task 6(copy 모듈)·8(폼 UI)·11(SignatureWall)은 `src/app/en/petition/page.tsx`가 참조하는
> `englishPetitionFormCopy`·`englishPetitionSuccessCopy`·`englishPetitionShareEditFields`·
> `RecentSignatures`·`usePetitionSignatureSummary`의 옛 반환 필드를 없앤다. 또 Task 5가
> `SignatureFormValues`에 지역 필드를 추가하는 순간 홈 인라인 서명 폼이 컴파일되지 않는다.
> 그래서 이 계획의 실행 순서는 번호 순이 아니다 — 문서 상단 "실행 순서"를 따라
> **Task 1~5 → 14 → 15 → 6~13 → 16 → 17** 로 실행한다. 그러면 어느 커밋에서도
> `npm run build`가 깨지지 않는다.

---

### Task 6: copy 모듈 재작성 — 영문 폼 카피 제거 + 신규 필드 카피 추가

**Files:**
- Modify: `website/src/components/petition/copy/types.ts`
- Modify: `website/src/components/petition/copy/form.ts`
- Modify: `website/src/components/petition/copy/success.ts`
- Modify: `website/src/components/petition/copy/share.ts`
- Guard: `website/scripts/check-petition-copy-refactor.mjs`

**Interfaces:**
- Consumes: 없음 (이 Task가 2부의 기초 데이터 계층)
- Produces:
  ```ts
  export interface PetitionSignatureFormCopy {
    page: string;
    fieldIdPrefix: string;
    labels: {
      name: PetitionEditableTextCopy;
      email: PetitionEditableTextCopy;
      message: PetitionEditableTextCopy;
      messageOptional: PetitionEditableTextCopy;
      regionLabel: PetitionEditableTextCopy;
      affiliationLabel: PetitionEditableTextCopy;
      namePublicLabel: PetitionEditableTextCopy;
      namePublicYes: PetitionEditableTextCopy;
      namePublicNo: PetitionEditableTextCopy;
      namePublicNote: PetitionEditableTextCopy;
      privacyPrefix?: PetitionEditableTextCopy;
      privacyToggle: PetitionEditableTextCopy;
      privacySuffix: PetitionEditableTextCopy;
      age: PetitionEditableTextCopy;
      submit: PetitionEditableTextCopy;
      submitting: PetitionEditableTextCopy;
    };
    placeholders: {
      name: PetitionEditableValueCopy;
      email: PetitionEditableValueCopy;
      message: PetitionEditableValueCopy;
      affiliationPlaceholder: PetitionEditableValueCopy;
      regionTopPlaceholder: PetitionEditableValueCopy;
      regionSubPlaceholder: PetitionEditableValueCopy;
      overseasSubPlaceholder: PetitionEditableValueCopy;
    };
    errors: {
      name: PetitionEditableValueCopy;
      emailRequired: PetitionEditableValueCopy;
      emailInvalid: PetitionEditableValueCopy;
      privacy: PetitionEditableValueCopy;
      age: PetitionEditableValueCopy;
      submit: PetitionEditableValueCopy;
    };
    privacyLines: PetitionEditableTextCopy[];
  }
  export const koreanPetitionFormCopy: PetitionSignatureFormCopy;
  export const koreanPetitionSuccessCopy: PetitionSuccessCopy;
  export const koreanPetitionShareEditFields: PetitionShareEditField[];
  ```
  (`errors` 그룹은 이름만 유지 — Task 8에서 실제 검증 메시지는
  `validateSignatureForm()`이 직접 반환하므로 `errors.name` 등은 더 이상 검증 흐름에
  쓰이지 않는다. `errors.submit`만 제출 실패 폴백 문구로 계속 쓰인다.)

- [ ] **Step 1: 가드부터 새 계약으로 재작성해 실패시킨다**

  `website/scripts/check-petition-copy-refactor.mjs`를 아래로 전체 교체한다. 이 시점엔
  `copy/*.ts`가 아직 옛 계약(영문 export 보유, 신규 필드 없음)이므로 가드가 실패해야 정상이다.

  ```js
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  const copyBarrelPath = "src/components/petition/petition-copy.ts";
  const copyModulePaths = [
    "src/components/petition/copy/types.ts",
    "src/components/petition/copy/form.ts",
    "src/components/petition/copy/success.ts",
    "src/components/petition/copy/share.ts",
  ];

  for (const modulePath of copyModulePaths) {
    assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
  }

  const copyBarrelSource = read(copyBarrelPath);
  assert(
    copyBarrelSource.trim().split(/\r?\n/).length <= 8,
    "petition-copy.ts must stay a small compatibility barrel.",
  );

  for (const exportedModule of ["./copy/types", "./copy/form", "./copy/success", "./copy/share"]) {
    assert(
      copyBarrelSource.includes(`export * from "${exportedModule}";`),
      `petition-copy.ts must re-export ${exportedModule}.`,
    );
  }

  for (const banned of [
    "contentKey:",
    "defaultValue:",
    "privacyLines:",
    "primaryShareClassName:",
    "koreanPetitionFormCopy:",
    "englishPetitionFormCopy:",
  ]) {
    assert(
      !copyBarrelSource.includes(banned),
      `petition-copy.ts must not own petition copy data: found ${banned}.`,
    );
  }

  const typeSource = read("src/components/petition/copy/types.ts");
  for (const exportName of [
    "PetitionEditableTextCopy",
    "PetitionEditableValueCopy",
    "PetitionSignatureFormCopy",
    "PetitionSuccessCopy",
    "PetitionShareEditField",
  ]) {
    assert(typeSource.includes(`export interface ${exportName}`), `copy/types.ts must export ${exportName}.`);
  }
  for (const newField of [
    "regionLabel",
    "regionTopPlaceholder",
    "regionSubPlaceholder",
    "overseasSubPlaceholder",
    "affiliationLabel",
    "affiliationPlaceholder",
    "namePublicLabel",
    "namePublicYes",
    "namePublicNo",
    "namePublicNote",
  ]) {
    assert(
      typeSource.includes(newField),
      `copy/types.ts must declare ${newField} on PetitionSignatureFormCopy.`,
    );
  }

  const formSource = read("src/components/petition/copy/form.ts");
  for (const required of [
    "koreanPetitionFormCopy",
    'fieldIdPrefix: "sig"',
    "privacyLines",
    "regionLabel",
    "regionTopPlaceholder",
    "regionSubPlaceholder",
    "overseasSubPlaceholder",
    "affiliationLabel",
    "affiliationPlaceholder",
    "namePublicLabel",
    "namePublicYes",
    "namePublicNo",
    "namePublicNote",
  ]) {
    assert(formSource.includes(required), `copy/form.ts must contain ${required}.`);
  }
  for (const removed of ["englishPetitionFormCopy", 'fieldIdPrefix: "en-sig"']) {
    assert(
      !formSource.includes(removed),
      `copy/form.ts must not contain ${removed} (English form copy removed).`,
    );
  }

  const successSource = read("src/components/petition/copy/success.ts");
  for (const required of ["koreanPetitionSuccessCopy", "countLocale", "primaryShareClassName"]) {
    assert(successSource.includes(required), `copy/success.ts must contain ${required}.`);
  }
  assert(
    !successSource.includes("englishPetitionSuccessCopy"),
    "copy/success.ts must not contain englishPetitionSuccessCopy (English form removed).",
  );

  const shareSource = read("src/components/petition/copy/share.ts");
  for (const required of ["koreanPetitionShareEditFields", 'section: "share"']) {
    assert(shareSource.includes(required), `copy/share.ts must contain ${required}.`);
  }
  assert(
    !shareSource.includes("englishPetitionShareEditFields"),
    "copy/share.ts must not contain englishPetitionShareEditFields (English form removed).",
  );

  console.log("Petition copy refactor checks passed.");
  ```

  Run: `cd website && npm run check:petition-copy-refactor 2>/dev/null || node scripts/check-petition-copy-refactor.mjs`
  Expected: `copy/types.ts must declare regionLabel on PetitionSignatureFormCopy.` 에러로 실패.

- [ ] **Step 2: `copy/types.ts`에 신규 필드 추가**

  `PetitionSignatureFormCopy`의 `labels`에 `regionLabel, affiliationLabel, namePublicLabel,
  namePublicYes, namePublicNo, namePublicNote`를, `placeholders`에 `affiliationPlaceholder,
  regionTopPlaceholder, regionSubPlaceholder, overseasSubPlaceholder`를 추가한다(다른 인터페이스는
  그대로). 결과는 위 "Produces" 블록과 동일하다.

- [ ] **Step 3: `copy/form.ts` — 영문 export 제거 + 한글 카피에 신규 키 채우기**

  ```ts
  import type { PetitionSignatureFormCopy } from "./types";

  export const koreanPetitionFormCopy: PetitionSignatureFormCopy = {
    page: "petition",
    fieldIdPrefix: "sig",
    labels: {
      name: { contentKey: "petition.form.nameLabel", defaultValue: "이름 또는 닉네임" },
      email: { contentKey: "petition.form.emailLabel", defaultValue: "이메일" },
      message: { contentKey: "petition.form.messageLabel", defaultValue: "제안 한마디" },
      messageOptional: { contentKey: "petition.form.messageOptional", defaultValue: "(선택)" },
      regionLabel: { contentKey: "petition.form.regionLabel", defaultValue: "거주 지역" },
      affiliationLabel: {
        contentKey: "petition.form.affiliationLabel",
        defaultValue: "소속 단체 또는 모임",
      },
      namePublicLabel: {
        contentKey: "petition.form.namePublicLabel",
        defaultValue: "이름 공개 여부",
      },
      namePublicYes: {
        contentKey: "petition.form.namePublicYes",
        defaultValue: "이름을 명단에 공개합니다",
      },
      namePublicNo: {
        contentKey: "petition.form.namePublicNo",
        defaultValue: "공개하지 않습니다",
      },
      namePublicNote: {
        contentKey: "petition.form.namePublicNote",
        defaultValue: "공개를 선택하시면 이 페이지 하단 명단에 이름과 지역이 표시됩니다.",
      },
      privacyToggle: {
        contentKey: "petition.form.privacyToggle",
        defaultValue: "개인정보 수집·이용",
      },
      privacySuffix: {
        contentKey: "petition.form.privacyConsentSuffix",
        defaultValue: "에 동의합니다.",
      },
      age: { contentKey: "petition.form.ageLabel", defaultValue: "만 14세 이상입니다." },
      submit: { contentKey: "petition.form.submit", defaultValue: "서명하기" },
      submitting: { contentKey: "petition.form.submitting", defaultValue: "서명 중..." },
    },
    placeholders: {
      name: {
        contentKey: "petition.form.namePlaceholder",
        defaultValue: "홍길동",
        buttonLabel: "이름 힌트",
      },
      email: {
        contentKey: "petition.form.emailPlaceholder",
        defaultValue: "example@email.com",
        buttonLabel: "이메일 힌트",
      },
      message: {
        contentKey: "petition.form.messagePlaceholder",
        defaultValue: "주민분들께 응원의 말씀이나 하고 싶은 말을 남겨주세요",
        buttonLabel: "메시지 힌트",
        multiline: true,
      },
      affiliationPlaceholder: {
        contentKey: "petition.form.affiliationPlaceholder",
        defaultValue: "예: OO환경모임 (선택)",
        buttonLabel: "소속 힌트",
      },
      regionTopPlaceholder: {
        contentKey: "petition.form.regionTopPlaceholder",
        defaultValue: "시·도 선택",
        buttonLabel: "시·도 안내",
      },
      regionSubPlaceholder: {
        contentKey: "petition.form.regionSubPlaceholder",
        defaultValue: "시·군·구 선택",
        buttonLabel: "시·군·구 안내",
      },
      overseasSubPlaceholder: {
        contentKey: "petition.form.overseasSubPlaceholder",
        defaultValue: "거주 국가 또는 도시",
        buttonLabel: "해외 거주지 안내",
      },
    },
    errors: {
      name: {
        contentKey: "petition.form.errorName",
        defaultValue: "이름을 입력해주세요.",
        buttonLabel: "이름 오류",
      },
      emailRequired: {
        contentKey: "petition.form.errorEmailRequired",
        defaultValue: "이메일을 입력해주세요.",
        buttonLabel: "이메일 필수",
      },
      emailInvalid: {
        contentKey: "petition.form.errorEmailInvalid",
        defaultValue: "올바른 이메일 형식을 입력해주세요.",
        buttonLabel: "이메일 형식",
      },
      privacy: {
        contentKey: "petition.form.errorPrivacy",
        defaultValue: "개인정보 수집·이용에 동의해주세요.",
        buttonLabel: "개인정보 오류",
      },
      age: {
        contentKey: "petition.form.errorAge",
        defaultValue: "만 14세 이상 확인이 필요합니다.",
        buttonLabel: "연령 오류",
      },
      submit: {
        contentKey: "petition.form.errorSubmit",
        defaultValue: "서명 제출에 실패했습니다. 다시 시도해주세요.",
        buttonLabel: "제출 오류",
      },
    },
    privacyLines: [
      { contentKey: "petition.form.privacyLine1", defaultValue: "수집 항목: 이름, 지역, 이메일(선택), 소속(선택)" },
      {
        contentKey: "petition.form.privacyLine2",
        defaultValue: "수집 목적: 연대서명 집계 및 성명서 발표, 관련 공론화 활동",
      },
      {
        contentKey: "petition.form.privacyLine3",
        defaultValue: "보유 기간: 목적 달성 후 즉시 파기",
      },
      {
        contentKey: "petition.form.privacyLine4",
        defaultValue: "동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다.",
      },
    ],
  };
  ```

  (`englishPetitionFormCopy` 전체 블록을 삭제한다.)

- [ ] **Step 4: `copy/success.ts` — 영문 export 제거**

  `englishPetitionSuccessCopy` 블록을 삭제하고 `koreanPetitionSuccessCopy`만 남긴다(값은
  기존과 동일, 변경 없음):

  ```ts
  import type { PetitionSuccessCopy } from "./types";

  export const koreanPetitionSuccessCopy: PetitionSuccessCopy = {
    page: "petition",
    countLocale: "ko-KR",
    titlePrefix: { contentKey: "petition.success.titlePrefix", defaultValue: "감사합니다," },
    titleSuffix: { contentKey: "petition.success.titleSuffix", defaultValue: "님!" },
    countSuffix: {
      contentKey: "petition.success.countSuffix",
      defaultValue: "번째로 함께해주셨습니다.",
    },
    sharePrompt: {
      contentKey: "petition.success.sharePrompt",
      defaultValue: "더 많은 사람에게 알려주세요",
    },
    primaryShare: { contentKey: "petition.success.shareKakao", defaultValue: "카카오톡 공유" },
    primaryShareClassName:
      "min-h-[48px] px-6 py-3 rounded-full bg-[#FEE500] text-[#191919] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90",
    twitterShare: { contentKey: "petition.success.shareTwitter", defaultValue: "트위터 공유" },
    copyLabel: { contentKey: "petition.success.copy", defaultValue: "URL 복사" },
    copiedLabel: { contentKey: "petition.success.copied", defaultValue: "복사됨!" },
    resetLabel: { contentKey: "petition.success.reset", defaultValue: "다른 사람도 서명하기" },
  };
  ```

- [ ] **Step 5: `copy/share.ts` — 영문 export 제거 + 새 히어로 카피에 맞춰 기본 공유 문구 갱신**

  ```ts
  import type { PetitionShareEditField } from "./types";

  export const koreanPetitionShareEditFields: PetitionShareEditField[] = [
    {
      contentKey: "petition.share.title",
      defaultValue: "우리가 나무다 — 풍천리 국민 연대서명",
      page: "petition",
      section: "share",
      buttonLabel: "공유 제목",
    },
    {
      contentKey: "petition.share.text",
      defaultValue: "홍천 풍천리 양수발전소 백지화를 위한 국민 연대서명에 함께해주세요.",
      page: "petition",
      section: "share",
      buttonLabel: "공유 설명",
      multiline: true,
    },
    {
      contentKey: "petition.share.copyFallback",
      defaultValue: "링크가 복사되었습니다.",
      page: "petition",
      section: "share",
      buttonLabel: "복사 알림",
    },
  ];
  ```

- [ ] **Step 6: 가드 통과 확인**

  Run: `cd website && node scripts/check-petition-copy-refactor.mjs`
  Expected: `Petition copy refactor checks passed.`

- [ ] **Step 7: 커밋**

  Run:
  ```
  cd website && git add src/components/petition/copy scripts/check-petition-copy-refactor.mjs \
    && git commit -m "$(cat <<'EOF'
  서명 카피에서 영문 폼 export 제거하고 지역·소속·이름공개 필드 카피 추가 — copy 모듈·가드 재작성

  국민 연대서명 폼 확장(지역/소속/이름공개)에 맞춰 PetitionSignatureFormCopy를 확장하고,
  영문 서명 폼이 폐지되면서 불필요해진 englishPetitionFormCopy·englishPetitionSuccessCopy·
  englishPetitionShareEditFields를 제거했다. petition-copy.ts 배럴과 하위 컴포넌트는
  아직 옛 계약을 참조하므로 Task 8까지는 타입 에러가 남는다.
  EOF
  )"
  ```
  Expected: 커밋 생성. (이 시점엔 `PetitionSignatureForm.tsx` 등 소비자가 아직 옛 필드를
  참조해 `npm run build`는 실패한다 — Task 8에서 해소된다. 소비자 없는 순수 데이터 계층
  커밋이므로 여기서는 `tsc --noEmit`을 돌리지 않는다.)

---

### Task 7: RegionSelect 컴포넌트 — 시·도 → 시·군·구, 해외는 자유입력

**Files:**
- Create: `website/src/components/petition/RegionSelect.tsx`

**Interfaces:**
- Consumes:
  ```ts
  // src/lib/regions.ts (Task 1~5 산출물)
  export const OVERSEAS_REGION: string;
  export const REGION_TOPS: string[];
  export function subsFor(top: string): string[];
  ```
- Produces:
  ```ts
  export interface RegionSelectProps {
    top: string;
    sub: string;
    onTopChange(value: string): void;
    onSubChange(value: string): void;
    error?: string;
    idPrefix: string;
    disabled?: boolean;
    labels: { top: string; sub: string; overseasPlaceholder: string };
  }
  export default function RegionSelect(props: RegionSelectProps): JSX.Element;
  ```

- [ ] **Step 1: 컴포넌트 작성**

  이 컴포넌트를 겨냥한 전용 가드는 없다(Task 8의 `check-petition-form-ui-refactor.mjs`가
  나중에 소비자 쪽에서 `"RegionSelect"` 문자열 존재를 검사한다). `src/lib/regions.ts`가
  아직 없다면(Task 1~5 미완료) 이 Step은 타입 에러가 나는 게 정상이다 — Task 1~5가 먼저
  머지되어 있어야 한다.

  ```tsx
  "use client";

  import { OVERSEAS_REGION, REGION_TOPS, subsFor } from "@/lib/regions";

  export interface RegionSelectProps {
    top: string;
    sub: string;
    onTopChange(value: string): void;
    onSubChange(value: string): void;
    error?: string;
    idPrefix: string;
    disabled?: boolean;
    labels: { top: string; sub: string; overseasPlaceholder: string };
  }

  export default function RegionSelect({
    top,
    sub,
    onTopChange,
    onSubChange,
    error,
    idPrefix,
    disabled = false,
    labels,
  }: RegionSelectProps) {
    const topId = `${idPrefix}-region-top`;
    const subId = `${idPrefix}-region-sub`;
    const errorId = `${idPrefix}-region-error`;
    const isOverseas = top === OVERSEAS_REGION;
    const subs = isOverseas ? [] : subsFor(top);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={topId}
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            {labels.top}
          </label>
          <select
            id={topId}
            required
            value={top}
            disabled={disabled}
            onChange={(event) => {
              onTopChange(event.target.value);
              onSubChange("");
            }}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
          >
            <option value="" disabled>
              {labels.top}
            </option>
            {REGION_TOPS.map((regionName) => (
              <option key={regionName} value={regionName}>
                {regionName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={subId}
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            {labels.sub}
          </label>
          {isOverseas ? (
            <input
              id={subId}
              type="text"
              required
              value={sub}
              disabled={disabled}
              onChange={(event) => onSubChange(event.target.value)}
              placeholder={labels.overseasPlaceholder}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
            />
          ) : (
            <select
              id={subId}
              required
              value={sub}
              disabled={disabled || !top}
              onChange={(event) => onSubChange(event.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition disabled:opacity-60"
            >
              <option value="" disabled>
                {labels.sub}
              </option>
              {subs.map((subName) => (
                <option key={subName} value={subName}>
                  {subName}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <p id={errorId} className="sm:col-span-2 -mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
  ```

  시·도를 바꾸면 `onSubChange("")`를 즉시 호출해 시·군·구를 초기화한다(요구사항). "해외"를
  고르면 시·군·구 select가 text input으로 바뀌어 자유 입력을 받는다.

- [ ] **Step 2: 타입 검증**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `RegionSelect.tsx` 관련 에러 없음(단, `src/lib/regions.ts`가 아직 없으면 그 모듈을
  가리키는 에러만 남고 나머지는 통과해야 한다).

- [ ] **Step 3: 커밋**

  Run:
  ```
  cd website && git add src/components/petition/RegionSelect.tsx && git commit -m "$(cat <<'EOF'
  서명 폼 지역 선택 컴포넌트 추가 — 시·도→시·군·구 연동, 해외는 자유입력

  국민 연대서명 폼의 거주 지역 필드(7필드 중 2번)를 위한 독립 컴포넌트. 시·도를
  바꾸면 시·군·구를 초기화하고, "해외" 선택 시 시·군·구 select를 텍스트 입력으로
  전환한다. Task 8에서 PetitionFormFields가 이 컴포넌트를 사용한다.
  EOF
  )"
  ```
  Expected: 커밋 생성.

---

### Task 8: 폼 UI 확장 — 지역·소속·이름공개 필드, 동의 체크박스 1개로 통합

**Files:**
- Modify: `website/src/components/petition/signature-form/types.ts`
- Modify: `website/src/components/petition/signature-form/usePetitionSignatureForm.ts`
- Modify: `website/src/components/petition/PetitionSignatureForm.tsx`
- Modify: `website/src/components/petition/PetitionFormFields.tsx`
- Modify: `website/src/components/petition/PetitionConsentFields.tsx`
- Guard: `website/scripts/check-petition-form-ui-refactor.mjs`
- Guard: `website/scripts/check-petition-signature-form-hook-refactor.mjs`

**Interfaces:**
- Consumes:
  ```ts
  // src/lib/signatures/api/config.ts (Task 1~5)
  export const MESSAGE_MAX_LENGTH = 500;
  export const NAME_MAX_LENGTH = 50;
  export const AFFILIATION_MAX_LENGTH = 60;
  // src/lib/signatures/form.ts (Task 1~5)
  export interface SignatureFormValues { name; email; message; regionTop; regionSub; affiliation; namePublic; agreePrivacy; agreeAge; }
  export interface SignatureFormErrors { name?; email?; message?; region?; affiliation?; namePublic?; agreePrivacy?; agreeAge?; }
  export function validateSignatureForm(values: SignatureFormValues): SignatureFormErrors;
  export function submitSignatureForm(values: SignatureFormValues): Promise<{ ok: true } | { ok: false; error: string }>;
  // Task 7
  import RegionSelect from "@/components/petition/RegionSelect";
  // Task 6
  koreanPetitionFormCopy.labels.{regionLabel,affiliationLabel,namePublicLabel,namePublicYes,namePublicNo,namePublicNote}
  koreanPetitionFormCopy.placeholders.{affiliationPlaceholder,regionTopPlaceholder,regionSubPlaceholder,overseasSubPlaceholder}
  ```
- Produces (교체된 `signature-form/types.ts`):
  ```ts
  export interface PetitionSignatureFormProps {
    formRef: RefObject<HTMLFormElement | null>;
    onSubmitted: (result: { name: string }) => void;
    onRefreshSignatures: () => void;
    copy?: PetitionSignatureFormCopy;
  }
  export interface PetitionSignatureFieldIds {
    nameId: string; emailId: string; messageId: string; messageCountId: string;
    affiliationId: string; namePublicYesId: string; namePublicNoId: string;
    namePublicErrorId: string; consentErrorId: string;
  }
  export interface PetitionSignaturePlaceholders {
    formNamePlaceholder: string; formEmailPlaceholder: string; formMessagePlaceholder: string;
    formAffiliationPlaceholder: string; regionTopPlaceholder: string; regionSubPlaceholder: string;
    overseasSubPlaceholder: string;
  }
  export interface PetitionSignatureFormState {
    isEditMode: boolean; submitting: boolean; submitError: string;
    name: string; email: string; message: string;
    regionTop: string; regionSub: string; affiliation: string; namePublic: boolean | null;
    agreePrivacy: boolean; agreeAge: boolean;
    errors: SignatureFormErrors; showPrivacy: boolean;
    ids: PetitionSignatureFieldIds; placeholders: PetitionSignaturePlaceholders;
    editFields: PetitionEditableValueCopy[];
    handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    handleFocusCapture: () => void;
    setName(value: string): void; setEmail(value: string): void; setMessage(value: string): void;
    setRegionTop(value: string): void; setRegionSub(value: string): void;
    setAffiliation(value: string): void; setNamePublic(value: boolean): void;
    setAgreeConsent(checked: boolean): void;
    togglePrivacy(): void; clearError(key: SignatureFormErrorKey): void;
  }
  ```

  **설계 메모 — 동의 체크박스 통합**: `agreePrivacy`/`agreeAge` state 변수 자체는 그대로
  둔다(값을 읽는 쪽 — 검사·클리어 로직 — 이 두 키를 그대로 쓰기 때문). 대신 새 setter
  `setAgreeConsent(checked)` 하나가 두 state를 동시에 같은 값으로 세팅한다. UI에는 체크박스가
  1개만 보이지만 `validateSignatureForm`에 넘기는 값과 `submitSignatureForm`에 넘기는 값은
  둘 다 채워진다(스펙 2절 "동의 기록" 요구사항).

  **설계 메모 — 검증 메시지 출처 변경**: 기존 훅은 `validateSignatureForm(values, messages)`에
  CMS 문구를 2번째 인자로 넘겨 메시지를 조립했다. 새 `validateSignatureForm(values)`는
  인자가 1개뿐이고 완성된 메시지를 직접 반환한다 — 필드별 검증 문구의 CMS 오버라이드는
  이번 리팩토링으로 사라진다(신규 필드인 지역/소속/이름공개는 애초에 그런 오버라이드가
  없었으므로 일관된 선택이다). `editFields`(관리자 편집 칩)에서도 `copy.errors.name` 등
  필드별 오류 문구는 더 이상 노출하지 않고, 제출 실패 폴백 문구(`copy.errors.submit`)만
  남긴다.

- [ ] **Step 1: 가드부터 새 계약으로 확장해 실패시킨다**

  `website/scripts/check-petition-form-ui-refactor.mjs`를 전체 교체:

  ```js
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  for (const path of [
    "src/components/petition/PetitionFormText.tsx",
    "src/components/petition/PetitionFormFields.tsx",
    "src/components/petition/PetitionConsentFields.tsx",
    "src/components/petition/PetitionFormEditControls.tsx",
    "src/components/petition/RegionSelect.tsx",
  ]) {
    assert(existsSync(join(root, path)), `${path} must exist.`);
  }

  const formSource = read("src/components/petition/PetitionSignatureForm.tsx");
  for (const componentName of [
    "PetitionFormText",
    "PetitionFormFields",
    "PetitionConsentFields",
    "PetitionFormEditControls",
  ]) {
    assert(formSource.includes(componentName), `PetitionSignatureForm must compose ${componentName}.`);
  }

  for (const removedResponsibility of [
    "function FormText",
    "function EditControl",
    "EditableText",
    "EditableValue",
    "htmlFor={nameId}",
    "htmlFor={emailId}",
    "htmlFor={messageId}",
  ]) {
    assert(
      !formSource.includes(removedResponsibility),
      `PetitionSignatureForm should not own ${removedResponsibility}.`,
    );
  }

  const fieldsSource = read("src/components/petition/PetitionFormFields.tsx");
  for (const expected of [
    "PetitionFormText",
    "SignatureFormErrors",
    "RegionSelect",
    "textarea",
    "message.length",
    "MESSAGE_MAX_LENGTH",
    'clearError("name")',
    'clearError("email")',
    'clearError("region")',
    'clearError("affiliation")',
    'clearError("namePublic")',
  ]) {
    assert(fieldsSource.includes(expected), `PetitionFormFields must include ${expected}.`);
  }

  const consentSource = read("src/components/petition/PetitionConsentFields.tsx");
  for (const expected of [
    "PetitionFormText",
    "SignatureFormErrors",
    "privacyLines.map",
    'clearError("agreePrivacy")',
    'clearError("agreeAge")',
    'type="checkbox"',
  ]) {
    assert(consentSource.includes(expected), `PetitionConsentFields must include ${expected}.`);
  }
  const checkboxCount = (consentSource.match(/type="checkbox"/g) ?? []).length;
  assert(checkboxCount === 1, "PetitionConsentFields must render exactly one checkbox (privacy+age merged).");

  const regionSelectSource = read("src/components/petition/RegionSelect.tsx");
  for (const expected of ["OVERSEAS_REGION", "REGION_TOPS", "subsFor", "export interface RegionSelectProps"]) {
    assert(regionSelectSource.includes(expected), `RegionSelect must include ${expected}.`);
  }

  const editControlsSource = read("src/components/petition/PetitionFormEditControls.tsx");
  for (const expected of ["EditableValue", "PetitionEditableValueCopy", "fields.map"]) {
    assert(
      editControlsSource.includes(expected),
      `PetitionFormEditControls must include ${expected}.`,
    );
  }

  const textSource = read("src/components/petition/PetitionFormText.tsx");
  for (const expected of ["EditableText", "PetitionEditableTextCopy", 'section="form"']) {
    assert(textSource.includes(expected), `PetitionFormText must include ${expected}.`);
  }

  console.log("Petition form UI refactor checks passed.");
  ```

  `website/scripts/check-petition-signature-form-hook-refactor.mjs`를 전체 교체:

  ```js
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  const mainPath = "src/components/petition/PetitionSignatureForm.tsx";
  const modulePaths = [
    "src/components/petition/signature-form/types.ts",
    "src/components/petition/signature-form/usePetitionSignatureForm.ts",
  ];

  for (const modulePath of modulePaths) {
    assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
  }

  const mainSource = read(mainPath);
  assert(
    mainSource.trim().split(/\r?\n/).length <= 130,
    "PetitionSignatureForm.tsx must stay a small orchestration component.",
  );

  for (const required of [
    "usePetitionSignatureForm",
    "PetitionFormFields",
    "PetitionConsentFields",
    "PetitionFormEditControls",
    "PetitionFormText",
  ]) {
    assert(mainSource.includes(required), `PetitionSignatureForm.tsx must include ${required}.`);
  }

  for (const banned of [
    "useState",
    "useCallback",
    "type FormEvent",
    "validateSignatureForm",
    "submitSignatureForm",
    "events.signatureStart",
    "events.signatureComplete",
    "getContent(",
    "setSignatureStartedTracked",
  ]) {
    assert(!mainSource.includes(banned), `PetitionSignatureForm.tsx must not own ${banned}.`);
  }

  const hookSource = read("src/components/petition/signature-form/usePetitionSignatureForm.ts");
  for (const required of [
    "useAdminEdit",
    "validateSignatureForm",
    "submitSignatureForm",
    "events.signatureStart",
    "events.signatureComplete",
    "handleSubmit",
    "handleFocusCapture",
    "clearError",
    "editFields",
    "regionTop",
    "regionSub",
    "affiliation",
    "namePublic",
    "setAgreeConsent",
  ]) {
    assert(hookSource.includes(required), `usePetitionSignatureForm.ts must contain ${required}.`);
  }
  assert(
    !hookSource.includes(".valid"),
    "usePetitionSignatureForm.ts must use validateSignatureForm's direct SignatureFormErrors return, not a {valid,errors} wrapper.",
  );

  const typesSource = read("src/components/petition/signature-form/types.ts");
  for (const required of [
    "PetitionSignatureFormProps",
    "copy?: PetitionSignatureFormCopy",
    "PetitionSignatureFormState",
    "PetitionSignatureFieldIds",
    "PetitionSignaturePlaceholders",
    "regionTop: string",
    "regionSub: string",
    "affiliation: string",
    "namePublic: boolean | null",
  ]) {
    assert(typesSource.includes(required), `signature-form/types.ts must contain ${required}.`);
  }

  console.log("Petition signature form hook refactor checks passed.");
  ```

  Run: `cd website && node scripts/check-petition-form-ui-refactor.mjs; node scripts/check-petition-signature-form-hook-refactor.mjs`
  Expected: 둘 다 `RegionSelect.tsx must include` 또는 `regionTop must contain` 계열 에러로 실패.

- [ ] **Step 2: `signature-form/types.ts` 교체**

  ```ts
  import type { FormEvent, RefObject } from "react";
  import type {
    PetitionEditableValueCopy,
    PetitionSignatureFormCopy,
  } from "@/components/petition/petition-copy";
  import type {
    SignatureFormErrorKey,
    SignatureFormErrors,
  } from "@/lib/signatures/form";

  export interface PetitionSignatureFormProps {
    formRef: RefObject<HTMLFormElement | null>;
    onSubmitted: (result: { name: string }) => void;
    onRefreshSignatures: () => void;
    copy?: PetitionSignatureFormCopy;
  }

  export interface PetitionSignatureFieldIds {
    nameId: string;
    emailId: string;
    messageId: string;
    messageCountId: string;
    affiliationId: string;
    namePublicYesId: string;
    namePublicNoId: string;
    namePublicErrorId: string;
    consentErrorId: string;
  }

  export interface PetitionSignaturePlaceholders {
    formNamePlaceholder: string;
    formEmailPlaceholder: string;
    formMessagePlaceholder: string;
    formAffiliationPlaceholder: string;
    regionTopPlaceholder: string;
    regionSubPlaceholder: string;
    overseasSubPlaceholder: string;
  }

  export interface PetitionSignatureFormState {
    isEditMode: boolean;
    submitting: boolean;
    submitError: string;
    name: string;
    email: string;
    message: string;
    regionTop: string;
    regionSub: string;
    affiliation: string;
    namePublic: boolean | null;
    agreePrivacy: boolean;
    agreeAge: boolean;
    errors: SignatureFormErrors;
    showPrivacy: boolean;
    ids: PetitionSignatureFieldIds;
    placeholders: PetitionSignaturePlaceholders;
    editFields: PetitionEditableValueCopy[];
    handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    handleFocusCapture: () => void;
    setName: (value: string) => void;
    setEmail: (value: string) => void;
    setMessage: (value: string) => void;
    setRegionTop: (value: string) => void;
    setRegionSub: (value: string) => void;
    setAffiliation: (value: string) => void;
    setNamePublic: (value: boolean) => void;
    setAgreeConsent: (checked: boolean) => void;
    togglePrivacy: () => void;
    clearError: (key: SignatureFormErrorKey) => void;
  }
  ```

- [ ] **Step 3: `usePetitionSignatureForm.ts` 교체**

  ```ts
  "use client";

  import { useCallback, useState, type FormEvent } from "react";
  import { events } from "@/lib/analytics";
  import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
  import {
    submitSignatureForm,
    validateSignatureForm,
    type SignatureFormErrorKey,
    type SignatureFormErrors,
  } from "@/lib/signatures/form";
  import type {
    PetitionSignatureFormProps,
    PetitionSignatureFormState,
  } from "./types";

  export function usePetitionSignatureForm({
    copy,
    onSubmitted,
    onRefreshSignatures,
  }: Required<Pick<PetitionSignatureFormProps, "copy" | "onSubmitted" | "onRefreshSignatures">>): PetitionSignatureFormState {
    const { getContent, isEditMode } = useAdminEdit();
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [regionTop, setRegionTop] = useState("");
    const [regionSub, setRegionSub] = useState("");
    const [affiliation, setAffiliation] = useState("");
    const [namePublic, setNamePublic] = useState<boolean | null>(null);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeAge, setAgreeAge] = useState(false);
    const [errors, setErrors] = useState<SignatureFormErrors>({});
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [signatureStartedTracked, setSignatureStartedTracked] = useState(false);

    const setAgreeConsent = useCallback((checked: boolean) => {
      setAgreePrivacy(checked);
      setAgreeAge(checked);
    }, []);

    const ids = {
      nameId: `${copy.fieldIdPrefix}-name`,
      emailId: `${copy.fieldIdPrefix}-email`,
      messageId: `${copy.fieldIdPrefix}-message`,
      messageCountId: `${copy.fieldIdPrefix}-message-count`,
      affiliationId: `${copy.fieldIdPrefix}-affiliation`,
      namePublicYesId: `${copy.fieldIdPrefix}-name-public-yes`,
      namePublicNoId: `${copy.fieldIdPrefix}-name-public-no`,
      namePublicErrorId: `${copy.fieldIdPrefix}-name-public-error`,
      consentErrorId: `${copy.fieldIdPrefix}-consent-error`,
    };

    const placeholders = {
      formNamePlaceholder:
        getContent(copy.placeholders.name.contentKey) ?? copy.placeholders.name.defaultValue,
      formEmailPlaceholder:
        getContent(copy.placeholders.email.contentKey) ?? copy.placeholders.email.defaultValue,
      formMessagePlaceholder:
        getContent(copy.placeholders.message.contentKey) ??
        copy.placeholders.message.defaultValue,
      formAffiliationPlaceholder:
        getContent(copy.placeholders.affiliationPlaceholder.contentKey) ??
        copy.placeholders.affiliationPlaceholder.defaultValue,
      regionTopPlaceholder:
        getContent(copy.placeholders.regionTopPlaceholder.contentKey) ??
        copy.placeholders.regionTopPlaceholder.defaultValue,
      regionSubPlaceholder:
        getContent(copy.placeholders.regionSubPlaceholder.contentKey) ??
        copy.placeholders.regionSubPlaceholder.defaultValue,
      overseasSubPlaceholder:
        getContent(copy.placeholders.overseasSubPlaceholder.contentKey) ??
        copy.placeholders.overseasSubPlaceholder.defaultValue,
    };

    const formSubmitFallbackError =
      getContent(copy.errors.submit.contentKey) ?? copy.errors.submit.defaultValue;

    const validate = useCallback((): boolean => {
      const result = validateSignatureForm({
        name,
        email,
        message,
        regionTop,
        regionSub,
        affiliation,
        namePublic,
        agreePrivacy,
        agreeAge,
      });

      setErrors(result);
      return Object.keys(result).length === 0;
    }, [affiliation, agreeAge, agreePrivacy, email, message, name, namePublic, regionSub, regionTop]);

    const clearError = useCallback((key: SignatureFormErrorKey) => {
      setErrors((current) => {
        if (!current[key]) return current;

        const next = { ...current };
        delete next[key];
        return next;
      });
    }, []);

    const handleSubmit = useCallback(
      async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setSubmitError("");

        const result = await submitSignatureForm({
          name,
          email,
          message,
          regionTop,
          regionSub,
          affiliation,
          namePublic,
          agreePrivacy,
          agreeAge,
        });

        setSubmitting(false);

        if (!result.ok) {
          setSubmitError(result.error || formSubmitFallbackError);
          return;
        }

        onSubmitted({ name });
        events.signatureComplete();
        onRefreshSignatures();
      },
      [
        affiliation,
        agreeAge,
        agreePrivacy,
        email,
        formSubmitFallbackError,
        message,
        name,
        namePublic,
        onRefreshSignatures,
        onSubmitted,
        regionSub,
        regionTop,
        validate,
      ],
    );

    const handleFocusCapture = useCallback(() => {
      if (signatureStartedTracked) return;
      events.signatureStart();
      setSignatureStartedTracked(true);
    }, [signatureStartedTracked]);

    const editFields = [
      copy.placeholders.name,
      copy.placeholders.email,
      copy.placeholders.message,
      copy.placeholders.affiliationPlaceholder,
      copy.placeholders.regionTopPlaceholder,
      copy.placeholders.regionSubPlaceholder,
      copy.placeholders.overseasSubPlaceholder,
      copy.labels.namePublicYes,
      copy.labels.namePublicNo,
      copy.labels.namePublicNote,
      copy.errors.submit,
    ];

    return {
      isEditMode,
      submitting,
      submitError,
      name,
      email,
      message,
      regionTop,
      regionSub,
      affiliation,
      namePublic,
      agreePrivacy,
      agreeAge,
      errors,
      showPrivacy,
      ids,
      placeholders,
      editFields,
      handleSubmit,
      handleFocusCapture,
      setName,
      setEmail,
      setMessage,
      setRegionTop,
      setRegionSub,
      setAffiliation,
      setNamePublic,
      setAgreeConsent,
      togglePrivacy: () => setShowPrivacy((current) => !current),
      clearError,
    };
  }
  ```

- [ ] **Step 4: `PetitionFormFields.tsx` 교체**

  ```tsx
  "use client";

  import PetitionFormText from "@/components/petition/PetitionFormText";
  import RegionSelect from "@/components/petition/RegionSelect";
  import type { PetitionSignatureFormCopy } from "@/components/petition/petition-copy";
  import type {
    PetitionSignatureFieldIds,
    PetitionSignaturePlaceholders,
  } from "@/components/petition/signature-form/types";
  import {
    AFFILIATION_MAX_LENGTH,
    MESSAGE_MAX_LENGTH,
    NAME_MAX_LENGTH,
  } from "@/lib/signatures/api/config";
  import type {
    SignatureFormErrorKey,
    SignatureFormErrors,
  } from "@/lib/signatures/form";

  interface PetitionFormFieldsProps {
    copy: PetitionSignatureFormCopy;
    name: string;
    email: string;
    message: string;
    regionTop: string;
    regionSub: string;
    affiliation: string;
    namePublic: boolean | null;
    errors: SignatureFormErrors;
    ids: PetitionSignatureFieldIds;
    placeholders: PetitionSignaturePlaceholders;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onMessageChange: (value: string) => void;
    onRegionTopChange: (value: string) => void;
    onRegionSubChange: (value: string) => void;
    onAffiliationChange: (value: string) => void;
    onNamePublicChange: (value: boolean) => void;
    clearError: (key: SignatureFormErrorKey) => void;
  }

  export default function PetitionFormFields({
    copy,
    name,
    email,
    message,
    regionTop,
    regionSub,
    affiliation,
    namePublic,
    errors,
    ids,
    placeholders,
    onNameChange,
    onEmailChange,
    onMessageChange,
    onRegionTopChange,
    onRegionSubChange,
    onAffiliationChange,
    onNamePublicChange,
    clearError,
  }: PetitionFormFieldsProps) {
    return (
      <>
        <div>
          <label
            htmlFor={ids.nameId}
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            <PetitionFormText copy={copy} text={copy.labels.name} />{" "}
            <span className="text-[var(--color-warm)]">*</span>
          </label>
          <input
            id={ids.nameId}
            type="text"
            required
            maxLength={NAME_MAX_LENGTH}
            value={name}
            onChange={(event) => {
              onNameChange(event.target.value);
              if (errors.name) clearError("name");
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${ids.nameId}-error` : undefined}
            placeholder={placeholders.formNamePlaceholder}
            className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
          />
          {errors.name && (
            <p id={`${ids.nameId}-error`} className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]">
            <PetitionFormText copy={copy} text={copy.labels.regionLabel} />{" "}
            <span className="text-[var(--color-warm)]">*</span>
          </label>
          <RegionSelect
            top={regionTop}
            sub={regionSub}
            onTopChange={(value) => {
              onRegionTopChange(value);
              if (errors.region) clearError("region");
            }}
            onSubChange={(value) => {
              onRegionSubChange(value);
              if (errors.region) clearError("region");
            }}
            error={errors.region}
            idPrefix={copy.fieldIdPrefix}
            labels={{
              top: placeholders.regionTopPlaceholder,
              sub: placeholders.regionSubPlaceholder,
              overseasPlaceholder: placeholders.overseasSubPlaceholder,
            }}
          />
        </div>

        <div>
          <label
            htmlFor={ids.affiliationId}
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            <PetitionFormText copy={copy} text={copy.labels.affiliationLabel} />
          </label>
          <input
            id={ids.affiliationId}
            type="text"
            maxLength={AFFILIATION_MAX_LENGTH}
            value={affiliation}
            onChange={(event) => {
              onAffiliationChange(event.target.value);
              if (errors.affiliation) clearError("affiliation");
            }}
            aria-invalid={!!errors.affiliation}
            aria-describedby={errors.affiliation ? `${ids.affiliationId}-error` : undefined}
            placeholder={placeholders.formAffiliationPlaceholder}
            className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
          />
          {errors.affiliation && (
            <p id={`${ids.affiliationId}-error`} className="mt-1 text-sm text-red-600" role="alert">
              {errors.affiliation}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={ids.emailId}
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            <PetitionFormText copy={copy} text={copy.labels.email} />
          </label>
          <input
            id={ids.emailId}
            type="email"
            value={email}
            onChange={(event) => {
              onEmailChange(event.target.value);
              if (errors.email) clearError("email");
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${ids.emailId}-error` : undefined}
            placeholder={placeholders.formEmailPlaceholder}
            className="paper-field min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 transition"
          />
          {errors.email && (
            <p id={`${ids.emailId}-error`} className="mt-1 text-sm text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={ids.messageId}
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            <PetitionFormText copy={copy} text={copy.labels.message} />{" "}
            <PetitionFormText
              copy={copy}
              text={copy.labels.messageOptional}
              className="font-normal text-[var(--color-text-muted)]"
            />
          </label>
          <textarea
            id={ids.messageId}
            value={message}
            onChange={(event) => {
              if (event.target.value.length <= MESSAGE_MAX_LENGTH) onMessageChange(event.target.value);
            }}
            maxLength={MESSAGE_MAX_LENGTH}
            rows={4}
            placeholder={placeholders.formMessagePlaceholder}
            aria-describedby={ids.messageCountId}
            className="paper-field focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)]/30 resize-none transition"
          />
          <p id={ids.messageCountId} className="mt-1 text-right text-sm text-[var(--color-text-muted)]">
            {message.length}/{MESSAGE_MAX_LENGTH}
          </p>
        </div>

        <fieldset>
          <legend className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]">
            <PetitionFormText copy={copy} text={copy.labels.namePublicLabel} />{" "}
            <span className="text-[var(--color-warm)]">*</span>
          </legend>
          <div className="flex flex-wrap gap-4">
            <label
              htmlFor={ids.namePublicYesId}
              className="flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <input
                id={ids.namePublicYesId}
                type="radio"
                name={`${copy.fieldIdPrefix}-name-public`}
                checked={namePublic === true}
                onChange={() => {
                  onNamePublicChange(true);
                  if (errors.namePublic) clearError("namePublic");
                }}
                aria-describedby={errors.namePublic ? ids.namePublicErrorId : undefined}
                className="w-5 h-5 accent-[var(--color-warm)] cursor-pointer"
              />
              <PetitionFormText copy={copy} text={copy.labels.namePublicYes} />
            </label>
            <label
              htmlFor={ids.namePublicNoId}
              className="flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <input
                id={ids.namePublicNoId}
                type="radio"
                name={`${copy.fieldIdPrefix}-name-public`}
                checked={namePublic === false}
                onChange={() => {
                  onNamePublicChange(false);
                  if (errors.namePublic) clearError("namePublic");
                }}
                aria-describedby={errors.namePublic ? ids.namePublicErrorId : undefined}
                className="w-5 h-5 accent-[var(--color-warm)] cursor-pointer"
              />
              <PetitionFormText copy={copy} text={copy.labels.namePublicNo} />
            </label>
          </div>
          <PetitionFormText
            copy={copy}
            text={copy.labels.namePublicNote}
            as="p"
            className="mt-2 text-sm text-[var(--color-text-muted)]"
          />
          {errors.namePublic && (
            <p id={ids.namePublicErrorId} className="mt-1 text-sm text-red-600" role="alert">
              {errors.namePublic}
            </p>
          )}
        </fieldset>
      </>
    );
  }
  ```

- [ ] **Step 5: `PetitionConsentFields.tsx` 교체 — 체크박스 1개로 통합**

  ```tsx
  "use client";

  import PetitionFormText from "@/components/petition/PetitionFormText";
  import type { PetitionSignatureFormCopy } from "@/components/petition/petition-copy";
  import type {
    SignatureFormErrorKey,
    SignatureFormErrors,
  } from "@/lib/signatures/form";

  interface PetitionConsentFieldsProps {
    copy: PetitionSignatureFormCopy;
    agreePrivacy: boolean;
    agreeAge: boolean;
    errors: SignatureFormErrors;
    consentErrorId: string;
    showPrivacy: boolean;
    onConsentChange: (checked: boolean) => void;
    onTogglePrivacy: () => void;
    clearError: (key: SignatureFormErrorKey) => void;
  }

  export default function PetitionConsentFields({
    copy,
    agreePrivacy,
    agreeAge,
    errors,
    consentErrorId,
    showPrivacy,
    onConsentChange,
    onTogglePrivacy,
    clearError,
  }: PetitionConsentFieldsProps) {
    const checked = agreePrivacy && agreeAge;
    const consentError = errors.agreePrivacy ?? errors.agreeAge;

    return (
      <div>
        <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => {
              onConsentChange(event.target.checked);
              if (errors.agreePrivacy) clearError("agreePrivacy");
              if (errors.agreeAge) clearError("agreeAge");
            }}
            aria-invalid={!!consentError}
            aria-describedby={consentError ? consentErrorId : undefined}
            className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
          />
          <span className="text-[15px] text-[var(--color-text)]">
            {copy.labels.privacyPrefix && (
              <>
                <PetitionFormText copy={copy} text={copy.labels.privacyPrefix} />{" "}
              </>
            )}
            <button
              type="button"
              className="underline text-[var(--color-sky)] hover:text-[var(--color-sky)]/80"
              onClick={onTogglePrivacy}
            >
              <PetitionFormText copy={copy} text={copy.labels.privacyToggle} />
            </button>
            <PetitionFormText copy={copy} text={copy.labels.privacySuffix} />{" "}
            <PetitionFormText copy={copy} text={copy.labels.age} />{" "}
            <span className="text-[var(--color-warm)]">*</span>
          </span>
        </label>
        {showPrivacy && (
          <div className="ml-8 mt-2 p-4 bg-[var(--color-bg-warm)] rounded-xl text-sm text-[var(--color-text-muted)] leading-relaxed">
            {copy.privacyLines.map((line, index) => (
              <PetitionFormText
                key={line.contentKey}
                copy={copy}
                text={line}
                as="p"
                className={index < copy.privacyLines.length - 1 ? "mb-1" : ""}
              />
            ))}
          </div>
        )}
        {consentError && (
          <p id={consentErrorId} className="ml-8 mt-1 text-sm text-red-600" role="alert">
            {consentError}
          </p>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 6: `PetitionSignatureForm.tsx` 오케스트레이터 갱신**

  ```tsx
  "use client";

  import { Loader2, Send } from "lucide-react";
  import PetitionConsentFields from "@/components/petition/PetitionConsentFields";
  import PetitionFormEditControls from "@/components/petition/PetitionFormEditControls";
  import PetitionFormFields from "@/components/petition/PetitionFormFields";
  import PetitionFormText from "@/components/petition/PetitionFormText";
  import { koreanPetitionFormCopy } from "@/components/petition/petition-copy";
  import type { PetitionSignatureFormProps } from "@/components/petition/signature-form/types";
  import { usePetitionSignatureForm } from "@/components/petition/signature-form/usePetitionSignatureForm";

  export default function PetitionSignatureForm({
    formRef,
    onSubmitted,
    onRefreshSignatures,
    copy = koreanPetitionFormCopy,
  }: PetitionSignatureFormProps) {
    const form = usePetitionSignatureForm({ copy, onSubmitted, onRefreshSignatures });

    return (
      <>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit}
          onFocusCapture={form.handleFocusCapture}
          noValidate
          className="paper p-8 md:p-12"
        >
          <div className="relative z-[1] space-y-6">
            <PetitionFormFields
              copy={copy}
              name={form.name}
              email={form.email}
              message={form.message}
              regionTop={form.regionTop}
              regionSub={form.regionSub}
              affiliation={form.affiliation}
              namePublic={form.namePublic}
              errors={form.errors}
              ids={form.ids}
              placeholders={form.placeholders}
              onNameChange={form.setName}
              onEmailChange={form.setEmail}
              onMessageChange={form.setMessage}
              onRegionTopChange={form.setRegionTop}
              onRegionSubChange={form.setRegionSub}
              onAffiliationChange={form.setAffiliation}
              onNamePublicChange={form.setNamePublic}
              clearError={form.clearError}
            />

            <PetitionConsentFields
              copy={copy}
              agreePrivacy={form.agreePrivacy}
              agreeAge={form.agreeAge}
              errors={form.errors}
              consentErrorId={form.ids.consentErrorId}
              showPrivacy={form.showPrivacy}
              onConsentChange={form.setAgreeConsent}
              onTogglePrivacy={form.togglePrivacy}
              clearError={form.clearError}
            />

            {form.submitError && (
              <p className="text-sm text-red-600 text-center" role="alert">
                {form.submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={form.submitting}
              className="letter-btn letter-btn--primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {form.submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <PetitionFormText copy={copy} text={copy.labels.submitting} />
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <PetitionFormText copy={copy} text={copy.labels.submit} />
                </>
              )}
            </button>
          </div>
        </form>

        {form.isEditMode && <PetitionFormEditControls copy={copy} fields={form.editFields} />}
      </>
    );
  }
  ```

- [ ] **Step 7: 가드 통과 확인**

  Run: `cd website && node scripts/check-petition-form-ui-refactor.mjs && node scripts/check-petition-signature-form-hook-refactor.mjs`
  Expected: 둘 다 `... checks passed.` 출력.

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `src/app/en/petition/page.tsx`(범위 밖, 문서 상단 주의 참고) 관련 에러만 남고
  petition 컴포넌트 자체의 타입 에러는 없음.

- [ ] **Step 8: 커밋**

  Run:
  ```
  cd website && git add src/components/petition/signature-form src/components/petition/PetitionSignatureForm.tsx \
    src/components/petition/PetitionFormFields.tsx src/components/petition/PetitionConsentFields.tsx \
    scripts/check-petition-form-ui-refactor.mjs scripts/check-petition-signature-form-hook-refactor.mjs \
    && git commit -m "$(cat <<'EOF'
  서명 폼에 지역·소속·이름공개 필드 추가하고 동의 체크박스를 1개로 통합 — 훅·필드·가드 확장

  국민 연대서명 7필드(이름/지역/소속/이메일/메시지/이름공개/동의)를 구현했다. 지역은
  RegionSelect(시·도→시·군·구, 해외 자유입력), 이름 공개는 라디오 2택 필수, 동의는
  체크박스 1개로 보이지만 제출 시 agreePrivacy·agreeAge를 함께 true로 채운다. 검증은
  새 validateSignatureForm(values)가 완성된 메시지를 직접 반환하는 방식으로 바뀌어
  훅에서 CMS 메시지를 조립하던 로직을 걷어냈다.
  EOF
  )"
  ```
  Expected: 커밋 생성.

---

### Task 9: PetitionProgress — 목표 대비 진행률 + 3지표

**Files:**
- Create: `website/src/components/petition/PetitionProgress.tsx`

**Interfaces:**
- Consumes: 없음(순수 프레젠테이션 컴포넌트, 수치는 전부 props)
- Produces:
  ```ts
  export interface PetitionProgressProps {
    count: number;
    goal: number;
    regionCount: number;
    recent24h: number;
    loading: boolean;
  }
  export default function PetitionProgress(props: PetitionProgressProps): JSX.Element;
  ```

- [ ] **Step 1: 컴포넌트 작성**

  진행률 바는 CSS `transition`으로 처리한다(Framer Motion 불필요, Task 요구사항). 색은
  `--color-warm`(CTA 전용) 대신 `--color-forest`(포인트 그래픽 역할)를 쓴다.

  ```tsx
  "use client";

  export interface PetitionProgressProps {
    count: number;
    goal: number;
    regionCount: number;
    recent24h: number;
    loading: boolean;
  }

  export default function PetitionProgress({
    count,
    goal,
    regionCount,
    recent24h,
    loading,
  }: PetitionProgressProps) {
    const pct = goal > 0 ? Math.min(100, Math.round((count / goal) * 100)) : 0;

    return (
      <section className="paper p-6 sm:p-8" aria-label="서명 진행 현황">
        <div className="relative z-[1]">
          <div className="flex items-end justify-between mb-3">
            <p className="font-serif-display font-bold text-2xl sm:text-3xl text-[var(--color-text)]">
              {loading ? "…" : count.toLocaleString("ko-KR")}
              <span className="ml-1 text-base font-normal text-[var(--color-text-muted)]">
                / {goal.toLocaleString("ko-KR")}명
              </span>
            </p>
            <p className="text-lg font-bold text-[var(--color-forest)]">{pct}%</p>
          </div>

          <div
            className="h-3 w-full rounded-full bg-[var(--color-bg-warm)] overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[var(--color-forest)] transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <dt className="text-sm text-[var(--color-text-muted)]">참여 지역</dt>
              <dd className="mt-1 font-serif-display font-bold text-xl text-[var(--color-text)]">
                {loading ? "…" : `${regionCount.toLocaleString("ko-KR")}곳`}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--color-text-muted)]">최근 24시간</dt>
              <dd className="mt-1 font-serif-display font-bold text-xl text-[var(--color-text)]">
                {loading ? "…" : `${recent24h.toLocaleString("ko-KR")}명`}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 2: 검증**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `PetitionProgress.tsx` 관련 에러 없음.

- [ ] **Step 3: 커밋**

  Run:
  ```
  cd website && git add src/components/petition/PetitionProgress.tsx && git commit -m "$(cat <<'EOF'
  서명 진행률 컴포넌트 추가 — 목표 1만 명 대비 바 + 참여지역·최근24시간 지표

  국민 연대서명 페이지 2번 섹션(진행률). CSS transition으로 바를 채우고, warm은
  CTA 전용이라는 색 역할 원칙에 따라 진행률 강조색은 forest를 쓴다. Task 12에서
  petition/page.tsx가 이 컴포넌트를 조립한다.
  EOF
  )"
  ```
  Expected: 커밋 생성.

---

### Task 10: PetitionStatement — 성명서 4블록 + 숫자 카드 5종 + 맺음말

**Files:**
- Create: `website/src/components/petition/PetitionStatement.tsx`

**Interfaces:**
- Consumes: `@/components/editable` (`EditableText`, 기존 컴포넌트)
- Produces: `export default function PetitionStatement(): JSX.Element;` (props 없음)

카피는 설계 스펙 8절의 성명서 전문을 한 글자도 바꾸지 않고 옮긴다. `contentKey`는
`petition.statement.blockN.pM` 규칙(제목은 `.heading`)으로 통일한다.

- [ ] **Step 1: 컴포넌트 작성**

  ```tsx
  "use client";

  import { EditableText } from "@/components/editable";

  const PAGE = "petition";
  const SECTION = "statement";

  function StatementBlock({
    index,
    headingKey,
    headingDefault,
    paragraphs,
  }: {
    index: number;
    headingKey: string;
    headingDefault: string;
    paragraphs: { key: string; defaultValue: string }[];
  }) {
    return (
      <div className="paper p-6 sm:p-8">
        <div className="relative z-[1] space-y-4">
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest)]/10 flex items-center justify-center text-[var(--color-forest)] font-bold text-sm"
              aria-hidden="true"
            >
              {index}
            </span>
            <EditableText
              contentKey={headingKey}
              defaultValue={headingDefault}
              as="h3"
              page={PAGE}
              section={SECTION}
              className="font-serif-display font-bold text-lg sm:text-xl text-[var(--color-text)] pt-0.5"
            />
          </div>
          <div className="space-y-3 pl-11">
            {paragraphs.map((p) => (
              <EditableText
                key={p.key}
                contentKey={p.key}
                defaultValue={p.defaultValue}
                as="p"
                page={PAGE}
                section={SECTION}
                className="text-[var(--color-text-muted)] text-[15px] leading-relaxed"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  function StatCard({
    valueKey,
    valueDefault,
    labelKey,
    labelDefault,
  }: {
    valueKey: string;
    valueDefault: string;
    labelKey: string;
    labelDefault: string;
  }) {
    return (
      <div className="paper px-4 py-5 text-center">
        <div className="relative z-[1]">
          <EditableText
            contentKey={valueKey}
            defaultValue={valueDefault}
            as="p"
            page={PAGE}
            section={SECTION}
            className="font-serif-display font-bold text-2xl sm:text-3xl text-[var(--color-forest)]"
          />
          <EditableText
            contentKey={labelKey}
            defaultValue={labelDefault}
            as="p"
            page={PAGE}
            section={SECTION}
            className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]"
          />
        </div>
      </div>
    );
  }

  export default function PetitionStatement() {
    return (
      <section aria-label="성명서" className="space-y-6">
        <StatementBlock
          index={1}
          headingKey="petition.statement.block1.heading"
          headingDefault="1937년부터 여기 있었다"
          paragraphs={[
            {
              key: "petition.statement.block1.p1",
              defaultValue:
                "풍천리 잣나무숲은 1937년부터 이 자리에 있었습니다. 산림청은 2017년 이 숲을 10대 명품숲으로 뽑았고, 지금도 대한민국 100대 명품숲에 들어 있습니다.",
            },
            {
              key: "petition.statement.block1.p2",
              defaultValue:
                "이 마을은 국내 잣 생산량의 62%를 책임집니다. 숲과 계곡은 몇 세대에 걸쳐 주민들이 살아온 자리이자, 사람 아닌 생명들의 자리이기도 합니다.",
            },
            {
              key: "petition.statement.block1.p3",
              defaultValue:
                "멸종위기 야생생물 Ⅰ급이자 천연기념물인 산양과 수달, 멸종위기 Ⅱ급인 담비가 이곳에 삽니다. 국가가 법으로 지키겠다고 한 동물들입니다.",
            },
          ]}
        />

        <StatementBlock
          index={2}
          headingKey="petition.statement.block2.heading"
          headingDefault="111,999그루"
          paragraphs={[
            {
              key: "petition.statement.block2.p1",
              defaultValue:
                "이곳에 600MW 규모의 양수발전소가 추진되고 있습니다. 사업이 진행되면 나무 11만 1,999그루가 사라집니다. 이설도로 공사로 2,256그루는 이미 쓰러졌습니다.",
            },
            {
              key: "petition.statement.block2.p2",
              defaultValue:
                "숫자로 적으면 한 줄이지만, 한 그루마다 저마다의 시간이 있습니다. 그 나무에 기대어 사는 것들이 있고, 그것들끼리 얽혀 숲이 됩니다. 11만 1,999라는 숫자 뒤에 있는 건 셀 수 없는 관계와 세월입니다.",
            },
            {
              key: "petition.statement.block2.p3",
              defaultValue:
                "물에 잠기거나 집을 떠나야 하는 주민은 51가구입니다. 풍천리 사람들은 8년째 이 숲과 마을을 지키고 있습니다. 그 앞자리에 선 이들은 대개 이 마을에서 평생을 산 노인들입니다.",
            },
          ]}
        />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard
            valueKey="petition.statement.stats.trees.value"
            valueDefault="111,999"
            labelKey="petition.statement.stats.trees.label"
            labelDefault="사라질 나무(그루)"
          />
          <StatCard
            valueKey="petition.statement.stats.fallen.value"
            valueDefault="2,256"
            labelKey="petition.statement.stats.fallen.label"
            labelDefault="이미 쓰러진 나무"
          />
          <StatCard
            valueKey="petition.statement.stats.households.value"
            valueDefault="51"
            labelKey="petition.statement.stats.households.label"
            labelDefault="이주 대상 가구"
          />
          <StatCard
            valueKey="petition.statement.stats.jatShare.value"
            valueDefault="62%"
            labelKey="petition.statement.stats.jatShare.label"
            labelDefault="국내 잣 생산 비중"
          />
          <StatCard
            valueKey="petition.statement.stats.years.value"
            valueDefault="8년"
            labelKey="petition.statement.stats.years.label"
            labelDefault="지켜온 세월"
          />
        </div>

        <StatementBlock
          index={3}
          headingKey="petition.statement.block3.heading"
          headingDefault="양수발전이라는 셈법"
          paragraphs={[
            {
              key: "petition.statement.block3.p1",
              defaultValue:
                "양수발전은 전기를 만드는 방식이 아닙니다. 전기를 써서 물을 높은 곳으로 끌어올린 뒤, 그 물을 내려보내며 다시 전기를 얻습니다. 발전소라기보다 저장 장치에 가깝습니다.",
            },
            {
              key: "petition.statement.block3.p2",
              defaultValue:
                "미국 에너지정보청(EIA)과 국립재생에너지연구소(NREL)는 양수발전의 왕복효율을 약 80%로 봅니다. 넣은 전기의 5분의 1가량이 저장하고 되찾는 과정에서 사라진다는 뜻입니다.",
            },
          ]}
        />

        <StatementBlock
          index={4}
          headingKey="petition.statement.block4.heading"
          headingDefault="우리가 요구하는 것"
          paragraphs={[
            {
              key: "petition.statement.block4.p1",
              defaultValue:
                "전력을 저장할 설비가 필요하다는 것 자체를 부정하지 않습니다. 우리가 요구하는 것은 확인입니다.",
            },
            {
              key: "petition.statement.block4.p2",
              defaultValue:
                "이 사업이 정말 필요한지, 실제 저장 효과와 손실은 얼마인지, 공공재원은 얼마나 들어가는지, 법적 판단의 근거는 무엇인지. 투명하게 밝혀주십시오. 그리고 풍천리의 숲과 계곡을 남겨둔 채로 필요한 전력 기능을 확보할 방법을 함께 찾아주십시오.",
            },
            {
              key: "petition.statement.block4.p3",
              defaultValue:
                "우리는 보상을 요구하는 것이 아닙니다. 풍천리의 숲과 계곡, 그 안의 생명들이 지금 그대로 남기를 바랄 뿐입니다.",
            },
          ]}
        />

        <div className="text-center pt-2">
          <EditableText
            contentKey="petition.statement.closing.p1"
            defaultValue="우리가 나무입니다. 나무도 우리와 함께 사는 생명입니다."
            as="p"
            page={PAGE}
            section={SECTION}
            className="font-serif-display text-lg sm:text-xl text-[var(--color-text)]"
          />
          <EditableText
            contentKey="petition.statement.closing.p2"
            defaultValue="풍천리를 그대로. 숲을 그대로. 생명을 그대로."
            as="p"
            page={PAGE}
            section={SECTION}
            className="mt-2 font-serif-display font-bold text-xl sm:text-2xl text-[var(--color-text)]"
          />
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 2: 검증**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `PetitionStatement.tsx` 관련 에러 없음.

- [ ] **Step 3: 커밋**

  Run:
  ```
  cd website && git add src/components/petition/PetitionStatement.tsx && git commit -m "$(cat <<'EOF'
  성명서 컴포넌트 추가 — 4블록 본문 + 숫자 카드 5종 + 맺음말, 문단 단위 CMS 편집

  설계 스펙 8절 성명서 전문을 문단 단위 EditableText로 옮겼다(내용 변경 없음).
  111,999/2,256/51/62%/8년 숫자 카드를 2·3블록 사이에 배치해 나무 상실 규모를
  본문 흐름 안에서 바로 확인하게 했다.
  EOF
  )"
  ```
  Expected: 커밋 생성.

---

### Task 11: SignatureWall — 명단 벽 + 커서 페이지네이션, `usePetitionSignatureSummary` 재작성

**Files:**
- Create: `website/src/components/petition/SignatureWall.tsx`
- Modify: `website/src/components/petition/usePetitionSignatureSummary.ts`
- Delete: `website/src/components/petition/RecentSignatures.tsx`

**Interfaces:**
- Consumes:
  ```ts
  // src/lib/signatures/client.ts (Task 1~5)
  export async function fetchSignatureSummary(): Promise<SignatureSummary>;
  export async function fetchSignatureWall(cursor?: string | null): Promise<WallPage>;
  // src/lib/signatures/api/store.ts (Task 1~5)
  export interface SignatureSummary { count: number; regionCount: number; recent24h: number; goal: number }
  // src/lib/signatures/api/wall.ts (Task 1~5)
  export interface WallEntry { name: string; regionTop: string; regionSub: string; createdAt: string }
  export interface WallPage { entries: WallEntry[]; nextCursor: string | null }
  ```
- Produces:
  ```ts
  export interface SignatureWallProps { heading: string; emptyText: string; moreText: string; refreshToken?: number }
  export default function SignatureWall(props: SignatureWallProps): JSX.Element;

  // usePetitionSignatureSummary.ts
  export function usePetitionSignatureSummary(): {
    summary: SignatureSummary;
    loadingSummary: boolean;
    refreshSummary: () => Promise<void>;
  };
  ```

  **주의**: `RecentSignatures.tsx` 삭제와 `usePetitionSignatureSummary`의 반환 형태 변경
  (`signatureCount/setSignatureCount/signatures/loadingSignatures` → `summary/loadingSummary/
  refreshSummary`)은 `src/app/en/petition/page.tsx`가 옛 형태를 직접 참조하므로 그 파일의
  컴파일을 깨뜨린다. 문서 상단 "주의" 콜아웃 참고 — 이 Part 2 범위 밖에서 후속 처리된다.

- [ ] **Step 1: `RecentSignatures.tsx` 삭제**

  Run: `cd website && git rm src/components/petition/RecentSignatures.tsx`
  Expected: 파일 삭제가 스테이징됨.

- [ ] **Step 2: `usePetitionSignatureSummary.ts` 재작성**

  ```ts
  "use client";

  import { useCallback, useEffect, useState } from "react";
  import { fetchSignatureSummary } from "@/lib/signatures/client";
  import type { SignatureSummary } from "@/lib/signatures/api/store";

  const EMPTY_SUMMARY: SignatureSummary = { count: 0, regionCount: 0, recent24h: 0, goal: 0 };

  export function usePetitionSignatureSummary() {
    const [summary, setSummary] = useState<SignatureSummary>(EMPTY_SUMMARY);
    const [loadingSummary, setLoadingSummary] = useState(true);

    const refreshSummary = useCallback(async () => {
      try {
        const data = await fetchSignatureSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch signature summary:", err);
      } finally {
        setLoadingSummary(false);
      }
    }, []);

    useEffect(() => {
      refreshSummary();
    }, [refreshSummary]);

    return { summary, loadingSummary, refreshSummary };
  }
  ```

  (제출 직후 정확한 "당신은 N번째 서명자입니다" 랭크는 더 이상 서버 응답에서 오지 않는다
  — `submitSignatureForm`이 `{ok:true}`만 반환하기 때문. 대신 제출 성공 시
  `onRefreshSignatures`(=`refreshSummary`)가 호출되어 총 서명 수가 곧바로 갱신된다.)

- [ ] **Step 3: `SignatureWall.tsx` 작성**

  ```tsx
  "use client";

  import { useCallback, useEffect, useState } from "react";
  import { Loader2 } from "lucide-react";
  import { fetchSignatureWall } from "@/lib/signatures/client";
  import type { WallEntry } from "@/lib/signatures/api/wall";

  export interface SignatureWallProps {
    heading: string;
    emptyText: string;
    moreText: string;
    /** 값이 바뀌면 1페이지째부터 다시 불러온다. 서명 제출 직후 갱신용. */
    refreshToken?: number;
  }

  function formatWallDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  export default function SignatureWall({ heading, emptyText, moreText, refreshToken = 0 }: SignatureWallProps) {
    const [entries, setEntries] = useState<WallEntry[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadFirstPage = useCallback(async () => {
      setInitialLoading(true);
      try {
        const page = await fetchSignatureWall(null);
        setEntries(page.entries);
        setCursor(page.nextCursor);
        setHasMore(page.nextCursor !== null);
      } catch (err) {
        console.error("Failed to fetch signature wall:", err);
      } finally {
        setInitialLoading(false);
      }
    }, []);

    useEffect(() => {
      loadFirstPage();
      // refreshToken 이 바뀌면(= 서명 제출 성공) 1페이지째부터 다시 불러온다.
    }, [loadFirstPage, refreshToken]);

    const handleLoadMore = useCallback(async () => {
      if (!cursor || loadingMore) return;
      setLoadingMore(true);
      try {
        const page = await fetchSignatureWall(cursor);
        setEntries((current) => [...current, ...page.entries]);
        setCursor(page.nextCursor);
        setHasMore(page.nextCursor !== null);
      } catch (err) {
        console.error("Failed to fetch more signatures:", err);
      } finally {
        setLoadingMore(false);
      }
    }, [cursor, loadingMore]);

    return (
      <section className="w-full" aria-label={heading}>
        <h2 className="text-left font-serif-display font-bold text-xl sm:text-2xl mb-6 text-[var(--color-text)]">
          {heading}
        </h2>
        {initialLoading ? (
          <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center py-8 text-[var(--color-text-muted)]">{emptyText}</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entries.map((entry, index) => (
                <li
                  key={`${entry.name}-${entry.regionTop}-${entry.regionSub}-${entry.createdAt}-${index}`}
                  className={`paper px-5 py-4 ${index % 2 === 0 ? "paper-tilt-l" : "paper-tilt-r"}`}
                >
                  <div className="relative z-[1] flex items-center justify-between gap-3">
                    <span className="font-semibold text-[var(--color-text)]">{entry.name}</span>
                    <span className="text-sm text-[var(--color-text-muted)] text-right">
                      {entry.regionTop} {entry.regionSub}
                      <br />
                      <time dateTime={entry.createdAt}>{formatWallDate(entry.createdAt)}</time>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="letter-btn letter-btn--outline-light disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                  {moreText}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    );
  }
  ```

  명단 벽 응답에는 `name, regionTop, regionSub, createdAt`만 존재한다(스펙 6절) — 이메일/
  메시지/소속/ip_hash는 이 컴포넌트에 애초에 도달하지 않으므로 별도 마스킹 로직이 필요 없다.

- [ ] **Step 4: 검증**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `SignatureWall.tsx`·`usePetitionSignatureSummary.ts` 관련 에러 없음
  (`en/petition/page.tsx` 에러는 문서 상단 주의 참고, 이 Task 책임 범위 밖).

- [ ] **Step 5: 커밋**

  Run:
  ```
  cd website && git add src/components/petition/SignatureWall.tsx \
    src/components/petition/usePetitionSignatureSummary.ts \
    && git commit -m "$(cat <<'EOF'
  명단 벽 컴포넌트로 최근 서명 로테이션 교체 — 커서 페이지네이션 "더 보기"

  RecentSignatures(5건 로테이션)를 SignatureWall(공개 동의자 명단, 커서 페이지네이션)로
  교체했다. usePetitionSignatureSummary는 이제 GET /api/signatures 요약({count,
  regionCount, recent24h, goal})만 들고, 개별 서명 목록 조회는 GET /api/signatures/wall로
  분리됐다. en/petition 페이지는 이 커밋으로 컴파일이 깨지며, 별도 Task에서 재작성된다.
  EOF
  )"
  ```
  Expected: 커밋 생성.

---

### Task 12: PetitionFAQ + layout 메타데이터 + `/petition` 페이지 조립

**Files:**
- Create: `website/src/lib/petition-faq.ts`
- Create: `website/src/components/petition/PetitionFAQ.tsx`
- Modify: `website/src/app/petition/layout.tsx`
- Modify: `website/src/app/petition/page.tsx`

**Interfaces:**
- Consumes: Task 6(copy) · Task 9(`PetitionProgress`) · Task 10(`PetitionStatement`) ·
  Task 11(`SignatureWall`, `usePetitionSignatureSummary`) · Task 8(`PetitionSignatureForm`,
  `onSubmitted: (result:{name:string}) => void`) · 기존 `ShareButtons`, `SITE_URL`
  (`@/lib/site-config`), `SIGNATURE_GOAL`(`@/lib/signatures/api/config`, Task 1~5)
- Produces:
  ```ts
  // src/lib/petition-faq.ts
  export interface PetitionFaqItem { q: string; a: string }
  export const PETITION_FAQ: PetitionFaqItem[];
  // PetitionFAQ.tsx
  export default function PetitionFAQ(): JSX.Element; // props 없음
  ```

이 Task가 2부의 마지막 조립 지점이다 — `src/app/petition/page.tsx`를 설계 스펙 4절의
8행 구조(히어로 / 진행률 / 성명서(+숫자카드) / 폼 / 명단벽 / 공유 / FAQ)에 정확히 맞춰
재작성한다. 기존 페이지에 있던 "감정 프롬프트"(705번의 외침)와 "왜 서명이 중요한가" 목록
섹션은 스펙 4절 표에 없으므로 제거하고, 그 역할은 새 성명서(Task 10)가 대신한다.
`PetitionActionCards.tsx`는 **삭제하지 않는다** — `src/app/en/petition/page.tsx`가 여전히
그 컴포넌트를 쓰고 있어(범위 밖 Task가 나중에 정리), 지금 지우면 빌드가 깨진다. 그냥
새 `/petition` 페이지에서 렌더하지 않을 뿐이다.

- [ ] **Step 1: FAQ 데이터 — 페이지와 JSON-LD가 같은 소스를 쓰게 분리**

  `src/app/petition/layout.tsx`는 서버 컴포넌트라 CMS(`useAdminEdit`)를 못 쓴다.
  `FAQPage` JSON-LD가 화면에 보이는 답변과 항상 일치해야 하므로(스펙 4절), FAQ 본문은
  CMS로 편집하지 않고 두 파일이 같은 상수를 import하게 한다.

  ```ts
  export interface PetitionFaqItem {
    q: string;
    a: string;
  }

  export const PETITION_FAQ: PetitionFaqItem[] = [
    {
      q: "이름을 공개하지 않아도 서명할 수 있나요?",
      a: "네. 공개 여부와 참여 여부는 별개로 선택합니다. 공개하지 않음을 고르시면 총 서명 수에만 반영되고 명단에는 나오지 않습니다.",
    },
    {
      q: "이메일을 꼭 적어야 하나요?",
      a: "아닙니다. 이후 보전 활동의 진행 상황을 받아보고 싶으실 때만 적어주세요. 안내 목적 외에는 쓰지 않습니다.",
    },
    {
      q: "수집한 정보는 어떻게 쓰이나요?",
      a: "연대서명 집계와 성명서 발표, 관련 공론화 활동에만 씁니다. 목적을 달성하면 파기합니다.",
    },
    {
      q: "홍천 주민이 아니어도 되나요?",
      a: "됩니다. 전국 어디서든, 해외에서도 참여할 수 있습니다.",
    },
    {
      q: "실수로 두 번 서명했습니다.",
      a: "이메일을 적으셨다면 중복은 자동으로 걸러집니다. 그 외에는 문의처로 알려주시면 정리하겠습니다.",
    },
  ];
  ```

  (질문·답변 문구는 설계 스펙 8절 FAQ 5개를 그대로 옮겼다.)

- [ ] **Step 2: `PetitionFAQ.tsx` 작성 — 아코디언, 답변은 DOM에서 제거하지 않고 aria-hidden만 토글**

  ```tsx
  "use client";

  import { useState } from "react";
  import { ChevronDown } from "lucide-react";
  import { PETITION_FAQ } from "@/lib/petition-faq";

  export default function PetitionFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
      <section aria-label="자주 묻는 질문" className="space-y-3">
        <h2 className="text-left font-serif-display font-bold text-xl sm:text-2xl mb-2 text-[var(--color-text)]">
          자주 묻는 질문
        </h2>
        {PETITION_FAQ.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `petition-faq-panel-${index}`;
          const buttonId = `petition-faq-button-${index}`;

          return (
            <div key={item.q} className="paper px-5 py-4">
              <div className="relative z-[1]">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-3 text-left font-semibold text-[var(--color-text)] min-h-[44px]"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isOpen}
                    className="overflow-hidden"
                  >
                    <p className="pt-3 text-[15px] text-[var(--color-text-muted)] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    );
  }
  ```

- [ ] **Step 3: `layout.tsx` — 메타데이터 갱신 + `FAQPage` JSON-LD**

  ```tsx
  import type { Metadata } from "next";
  import { localeAlternates } from "@/lib/seo-alternates";
  import { PETITION_FAQ } from "@/lib/petition-faq";

  export const metadata: Metadata = {
    alternates: localeAlternates("/petition", "/en/petition"),
    title: "국민 연대서명 — 우리가 나무다 | 풍천리를 지켜주세요",
    description:
      "홍천 풍천리 양수발전소 백지화와 숲·계곡 보전을 위한 국민 연대서명에 참여해주세요. 목표 10,000명.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PETITION_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  export default function PetitionLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        {children}
      </>
    );
  }
  ```

- [ ] **Step 4: `page.tsx` 전면 재작성**

  ```tsx
  "use client";

  import { useCallback, useRef, useState } from "react";
  import SubHero from "@/components/SubHero";
  import { EditableText } from "@/components/editable";
  import ShareButtons from "@/components/ShareButtons";
  import PetitionAnimatedCounter from "@/components/petition/PetitionAnimatedCounter";
  import PetitionFAQ from "@/components/petition/PetitionFAQ";
  import PetitionProgress from "@/components/petition/PetitionProgress";
  import PetitionShareEditControls from "@/components/petition/PetitionShareEditControls";
  import PetitionSignatureForm from "@/components/petition/PetitionSignatureForm";
  import PetitionStatement from "@/components/petition/PetitionStatement";
  import PetitionSuccess from "@/components/petition/PetitionSuccess";
  import SignatureConfetti from "@/components/petition/SignatureConfetti";
  import SignatureWall from "@/components/petition/SignatureWall";
  import { usePetitionSignatureSummary } from "@/components/petition/usePetitionSignatureSummary";
  import { events } from "@/lib/analytics";
  import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
  import { SIGNATURE_GOAL } from "@/lib/signatures/api/config";
  import { SITE_URL } from "@/lib/site-config";

  export default function PetitionPage() {
    const { getContent, isEditMode } = useAdminEdit();
    const { summary, loadingSummary, refreshSummary } = usePetitionSignatureSummary();
    const [submitted, setSubmitted] = useState(false);
    const [submittedName, setSubmittedName] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const [urlCopied, setUrlCopied] = useState(false);

    const shareTitle = getContent("petition.share.title") ?? "우리가 나무다 — 풍천리 국민 연대서명";
    const shareText =
      getContent("petition.share.text") ?? "홍천 풍천리 양수발전소 백지화를 위한 국민 연대서명에 함께해주세요.";
    const shareCopyFallback = getContent("petition.share.copyFallback") ?? "링크가 복사되었습니다.";
    const formRef = useRef<HTMLFormElement>(null);

    const handleSignatureSubmitted = useCallback(({ name }: { name: string }) => {
      setSubmittedName(name);
      setSubmitted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    const handleCopyUrl = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        events.shareClick("copy_url");
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch {
        /* fallback: do nothing */
      }
    };

    const handleShareTwitter = useCallback(() => {
      const text = encodeURIComponent(shareText);
      const url = encodeURIComponent(window.location.href);
      events.shareClick("twitter");
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    }, [shareText]);

    const handleShareKakao = useCallback(async () => {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: shareTitle, text: shareText, url: window.location.href });
          events.shareClick("web_share");
        } catch {
          /* 사용자가 공유를 취소한 경우 */
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert(shareCopyFallback);
          events.shareClick("clipboard_share");
          setUrlCopied(true);
          setTimeout(() => setUrlCopied(false), 2000);
        } catch {
          /* fallback: do nothing */
        }
      }
    }, [shareCopyFallback, shareText, shareTitle]);

    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        {showConfetti && <SignatureConfetti />}

        <SubHero
          imageUrl="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535383_std.jpg"
          imageContentKey="petition.hero.image"
          imagePage="petition"
          imageSection="hero"
          title={<EditableText contentKey="petition.hero.title" defaultValue="우리가 나무다" as="span" page="petition" section="hero" />}
          subtitle={<EditableText contentKey="petition.hero.subtitle" defaultValue="홍천 풍천리 양수발전소 백지화와 숲·계곡 보전을 위한 국민 연대서명" as="span" page="petition" section="hero" />}
          eyebrow={<EditableText contentKey="petition.hero.eyebrow" defaultValue="국민 연대서명" as="span" page="petition" section="hero" />}
          variant="emphasis"
          metric={
            <div className="stamp-badge inline-block">
              <div className="stamp-badge__inner">
                <PetitionAnimatedCounter target={summary.count} />
                <EditableText
                  contentKey="petition.hero.metricLabel"
                  defaultValue="명이 함께하고 있습니다"
                  as="p"
                  page="petition"
                  section="hero"
                  className="text-sm text-[var(--color-text-muted)] mt-1"
                />
              </div>
            </div>
          }
        />

        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-16">
          <PetitionProgress
            count={summary.count}
            goal={SIGNATURE_GOAL}
            regionCount={summary.regionCount}
            recent24h={summary.recent24h}
            loading={loadingSummary}
          />

          <PetitionStatement />

          {!submitted ? (
            <section className="fade-in" id="signature-form" aria-label="서명 양식">
              <PetitionSignatureForm
                formRef={formRef}
                onSubmitted={handleSignatureSubmitted}
                onRefreshSignatures={refreshSummary}
              />
            </section>
          ) : (
            <div className="fade-in">
              <PetitionSuccess
                submittedName={submittedName}
                signatureCount={summary.count}
                urlCopied={urlCopied}
                onPrimaryShare={handleShareKakao}
                onShareTwitter={handleShareTwitter}
                onCopyUrl={handleCopyUrl}
                onReset={() => {
                  setSubmitted(false);
                  setSubmittedName("");
                  setUrlCopied(false);
                }}
              />
            </div>
          )}

          <SignatureWall
            heading="함께한 사람들"
            emptyText="아직 공개된 서명이 없습니다. 첫 번째로 이름을 남겨주세요!"
            moreText="더 보기"
          />

          <ShareButtons title={shareTitle} url={`${SITE_URL}/petition`} page="petition" section="share" locale="ko" />

          <PetitionFAQ />
        </div>

        {isEditMode && <PetitionShareEditControls />}
      </div>
    );
  }
  ```

- [ ] **Step 5: 검증**

  Run: `cd website && npx tsc --noEmit -p tsconfig.json`
  Expected: `src/app/petition/*`·`src/components/petition/*`(en/petition 제외) 관련 에러 없음.

  Run: `cd website && npm run lint`
  Expected: `/petition` 관련 새 경고·에러 없음.

  Run: `cd website && npm run build`
  Expected: `en/petition`에서만 실패(문서 상단 주의 참고, 범위 밖). `/petition`은 정적/동적
  분석 단계까지 정상 통과.

- [ ] **Step 6: 커밋**

  Run:
  ```
  cd website && git add src/lib/petition-faq.ts src/components/petition/PetitionFAQ.tsx \
    src/app/petition/layout.tsx src/app/petition/page.tsx \
    && git commit -m "$(cat <<'EOF'
  /petition 페이지 전면 재조립 — 진행률·성명서·명단벽·공유·FAQ 8단 구조 + FAQPage 구조화 데이터

  설계 스펙 4절의 새 페이지 구조(히어로/진행률/성명서/폼/명단벽/공유/FAQ)로
  petition/page.tsx를 다시 짰다. 옛 "705번의 외침" 감정 프롬프트와 "왜 서명이
  중요한가" 목록은 새 성명서로 대체되어 제거했다. layout.tsx에 FAQPage JSON-LD를
  추가했고, 답변 텍스트는 PetitionFAQ.tsx와 완전히 같은 소스(petition-faq.ts)를
  써서 구조화 데이터와 화면 텍스트가 어긋나지 않게 했다.

  en/petition 페이지는 이 2부(Task 6~12) 전 구간에 걸쳐 컴파일이 깨진 상태로
  남는다 — 요약형 재작성은 범위 밖 별도 Task 소관이며 최우선으로 이어 처리해야 한다.
  EOF
  )"
  ```
  Expected: 커밋 생성.
## 3부 — 통합·정리 (Task 13~17)

이 다섯 Task는 `/petition` 페이지 전면 교체의 마지막 국면을 다룬다. Task 1~12(다른 계획 조각)에서
`src/lib/regions.ts`, `src/lib/signatures/api/config.ts`(`SIGNATURE_GOAL`), `src/lib/signatures/api/store.ts`
(`SignatureSummary`), `src/lib/signatures/api/wall.ts`(`WallEntry`), 새 `signatures` 컬럼, `GET /api/signatures/wall`,
`PetitionProgress`·`PetitionStatement`·`SignatureWall`·`PetitionFAQ`·`RegionSelect` 컴포넌트, 7필드로 확장된
`PetitionFormFields`/`PetitionConsentFields`/`usePetitionSignatureForm`, `src/lib/signatures/client.ts`의
`SignatureSummary`(`{ count, regionCount, recent24h, goal }`) 재정의가 이미 끝났다고 가정한다. 이 문서의 각 Step은
그 가정이 깨졌을 때 무엇을 맞춰야 하는지 명시한다.

---

### Task 13: 빌더 섹션 목록 + 조립 검증 + 죽은 컴포넌트 정리

`/petition/page.tsx`와 `layout.tsx`의 재작성은 **Task 12가 소유한다.** 이 Task는 Task 12가
남긴 것을 마무리한다 — 관리자 빌더가 새 섹션 목록을 보게 하고, 조립 결과를 검증하고,
아무도 참조하지 않게 된 컴포넌트를 지운다.

**PetitionActionCards 처리 결정**: `src/components/petition/PetitionActionCards.tsx`를 실제로 읽은 결과, 3장
중 "서명하기" 카드는 스크롤로 폼(신설 5번 섹션)을 가리킬 뿐이고 "공유하기" 카드는 신설 7번 섹션(`ShareButtons`)과
내용이 겹친다. "후원하기" 카드만 고유하지만 스펙 4절의 8개 섹션 표에는 후원 섹션이 없고, 홈 CTA 카드
(`HomeCtaSection`의 `home.cta.cards`)가 이미 `/donate` 링크를 제공한다. Task 12가 `/petition/page.tsx`에서,
Task 15가 `/en/petition/page.tsx`에서 각각 참조를 걷어내므로 **이 Task에 와서야 지울 수 있다.**
더 일찍 지우면 아직 참조가 남은 페이지에서 빌드가 깨진다.

**Files:**
- Modify: `website/src/lib/custom-sections/pages.ts` — `EXISTING_PAGE_SECTIONS.petition` 신설
- Delete: `website/src/components/petition/PetitionActionCards.tsx`
- Guard Modify: `website/scripts/check-petition-refactor.mjs` — 삭제 단언 추가

**Interfaces:**
- Consumes: Task 12가 조립한 `src/app/petition/page.tsx`·`layout.tsx`, Task 11의 `usePetitionSignatureSummary`, Task 15가 축소한 `src/app/en/petition/page.tsx`.
- Produces: `EXISTING_PAGE_SECTIONS.petition` — 관리자 빌더가 새 섹션 목록을 보게 한다.

- [ ] **Step 1: `usePetitionSignatureSummary`가 새 요약 스키마인지 확인**

  이 훅의 재작성은 **Task 11이 소유한다.** 여기서는 이미 끝나 있는지만 확인하고, 아니라면
  Task 11을 먼저 끝내고 돌아온다. 같은 파일을 두 Task가 각자 재작성하면 서로를 덮어쓴다.

  Run: `cd website && grep -n "refreshSummary\|regionCount\|recent24h" src/components/petition/usePetitionSignatureSummary.ts`
  Expected: `summary`, `loadingSummary`, `refreshSummary`를 반환하고 `regionCount`·`recent24h`가
  보인다. `signatures`/`loadingSignatures`/`setSignatureCount`는 남아 있지 않다.

- [ ] **Step 2: `EXISTING_PAGE_SECTIONS.petition` 신설**

  현재 `pages.ts`에는 `petition` 키 자체가 없다(관리자 섹션 빌더가 이 페이지의 섹션 목록을 모르는 상태였다).
  새 8단 구조에 맞춰 추가한다. 스펙 4절의 "성명서"와 "숫자 카드" 두 행은 `PetitionStatement` 컴포넌트 하나가
  함께 담당하므로(Task 1~12에서 소제목 4블록 + 숫자 하이라이트를 한 컴포넌트로 구현) 섹션은 `statement` 하나로
  묶는다.

  ```ts
  // website/src/lib/custom-sections/pages.ts (EXISTING_PAGE_SECTIONS에 추가)
  export const EXISTING_PAGE_SECTIONS: Partial<
    Record<BuilderPageId, { id: string; label: string }[]>
  > = {
    home: [ /* ...기존... */ ],
    story: [ /* ...기존... */ ],
    press: [ /* ...기존... */ ],
    gallery: [ /* ...기존... */ ],
    en: [ /* ...기존... */ ],
    petition: [
      { id: "hero", label: "히어로" },
      { id: "progress", label: "진행률" },
      { id: "statement", label: "성명서" },
      { id: "form", label: "서명 폼" },
      { id: "wall", label: "서명자 명단" },
      { id: "share", label: "공유" },
      { id: "faq", label: "자주 묻는 질문" },
    ],
  };
  ```

- [ ] **Step 3: Task 12의 조립 결과 검증**

  `/petition/page.tsx`와 `layout.tsx`는 Task 12가 이미 재작성했다. 여기서는 스펙 4절의 8개 섹션이
  순서대로 들어갔는지, 죽은 참조가 남지 않았는지만 확인한다.

  Run: `cd website && grep -n "SubHero\|PetitionProgress\|PetitionStatement\|PetitionSignatureForm\|SignatureWall\|ShareButtons\|PetitionFAQ\|PetitionActionCards\|RecentSignatures" src/app/petition/page.tsx`
  Expected: `SubHero` → `PetitionProgress` → `PetitionStatement` → `PetitionSignatureForm` → `SignatureWall` → `ShareButtons` → `PetitionFAQ` 순으로 나타난다. `PetitionActionCards`와 `RecentSignatures`는 **하나도 나오지 않는다.**

  Run: `cd website && grep -n "FAQPage\|mainEntity" src/app/petition/layout.tsx`
  Expected: `FAQPage` JSON-LD가 있고 `PETITION_FAQ`를 import해서 쓴다(화면 문구와 같은 소스).

  둘 중 하나라도 어긋나면 Task 12로 돌아가 고친다 — 이 Task에서 page.tsx를 다시 쓰지 마라.

- [ ] **Step 4: `PetitionActionCards.tsx` 삭제 + 가드에 단언 추가**

  이 시점에 `/petition`(Task 12)과 `/en/petition`(Task 15) 둘 다 이 컴포넌트를 참조하지 않는다.
  먼저 그 사실을 확인하고 지운다.

  Run: `cd website && grep -rn "PetitionActionCards" src/ | grep -v "components/petition/PetitionActionCards.tsx"`
  Expected: 출력 없음. 하나라도 나오면 그 파일을 먼저 정리한다.

  Run: `cd website && git rm src/components/petition/PetitionActionCards.tsx`
  Expected: 파일 삭제가 스테이징됨.

  `check-petition-refactor.mjs`(Task 15가 재작성한 것)에 삭제 단언을 덧붙인다. 파일 맨 위 import에
  `existsSync`가 이미 들어 있는지 확인하고, 없으면 `import { existsSync, readFileSync } from "node:fs";`로 고친다.

  ```js
  // website/scripts/check-petition-refactor.mjs — 마지막 console.log 바로 앞에 추가
  assert(
    !existsSync(join(root, "src/components/petition/PetitionActionCards.tsx")),
    "PetitionActionCards must be removed once no page renders it.",
  );
  ```

  Run: `cd website && npm run petition:refactor:check && npm run build`
  Expected: `Petition refactor checks passed.` 출력 후 빌드 성공. 빌드가 깨지면 아직 남은 참조가 있다는 뜻이다.

- [ ] **Step 5: 커밋**

  Run: `cd website && git add src/app/petition/page.tsx src/app/petition/layout.tsx src/components/petition/usePetitionSignatureSummary.ts src/lib/custom-sections/pages.ts && git commit -m "$(cat <<'EOF'
  /petition 페이지를 국민 연대서명 8단 구조로 재조립 — 진행률·명단 벽·FAQ 신설, 액션 카드 제거

  진행률·서명자 명단·공유·FAQ 섹션을 새로 배치하고 관리자 섹션 빌더 목록도 갱신. 영향 범위: /petition 페이지, 관리자 섹션 빌더
  EOF
  )"`
  Expected: 새 커밋 1개 생성, `git status`가 clean.

---

### Task 14: 홈 CTA 인라인 서명 폼 제거

**Files:**
- Delete: `website/src/components/home/HomeInlineSignatureForm.tsx`
- Delete: `website/src/components/home/inline-signature/HomeInlineSignatureFields.tsx`
- Delete: `website/src/components/home/inline-signature/HomeInlineSignatureEditControls.tsx`
- Delete: `website/src/components/home/inline-signature/HomeInlineSignaturePrivacyNotice.tsx`
- Delete: `website/src/components/home/inline-signature/HomeInlineSignatureSuccess.tsx`
- Delete: `website/src/components/home/inline-signature/types.ts`
- Delete: `website/src/components/home/inline-signature/useHomeInlineSignatureForm.ts`
- Modify: `website/src/components/home/HomeCtaSection.tsx`
- Modify: `website/src/components/home/HomeClient.tsx`
- Guard Delete: `website/scripts/check-home-inline-signature-form-refactor.mjs`
- Guard Modify: `website/scripts/check-home-cta-refactor.mjs`
- Guard Modify: `website/scripts/check-signature-form-refactor.mjs` (홈 인라인 폼 파일을 직접 `read()`하므로, 지우고 나면 파일이 없어 예외로 죽는다 — 홈 번들 검사를 들어낸다)
- Modify: `website/package.json` — `home-inline-signature:refactor:check` 스크립트 제거

**Interfaces:**
- Consumes: 없음(순수 제거 작업).
- Produces: `HomeCtaSection`은 이제 `signatureCount: number | null`만 받는다. `onSignatureCountChange` prop은 완전히 사라진다.

- [ ] **Step 1: `check-home-cta-refactor.mjs`를 새 계약으로 먼저 고쳐 실패시킨다**

  ```js
  // website/scripts/check-home-cta-refactor.mjs
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  const inlineFormPath = "src/components/home/HomeInlineSignatureForm.tsx";
  assert(
    !existsSync(join(root, inlineFormPath)),
    "Home inline signature form must be removed — the petition flow now lives only at /petition.",
  );
  assert(
    !existsSync(join(root, "src/components/home/inline-signature")),
    "src/components/home/inline-signature must be removed along with the inline form.",
  );

  const sectionSource = read("src/components/home/HomeCtaSection.tsx");
  for (const banned of [
    "HomeInlineSignatureForm",
    "onSignatureCountChange",
    "inline-signature",
    "validateSignatureForm",
    "submitSignatureForm",
  ]) {
    assert(
      !sectionSource.includes(banned),
      `HomeCtaSection must not reference the removed inline form: found ${banned}.`,
    );
  }

  assert(
    /href=["']\/petition["']/.test(sectionSource) || sectionSource.includes('defaultHref="/petition"'),
    "HomeCtaSection must link to /petition instead of embedding a signature form.",
  );

  const clientSource = read("src/components/home/HomeClient.tsx");
  assert(
    !clientSource.includes("onSignatureCountChange"),
    "HomeClient must not wire onSignatureCountChange into HomeCtaSection anymore.",
  );

  console.log("Home CTA refactor checks passed.");
  ```

  Run: `cd website && npm run home-cta:refactor:check`
  Expected: FAIL — 현재 코드에는 여전히 `HomeInlineSignatureForm`과 `onSignatureCountChange`가 있다.

- [ ] **Step 2: 인라인 폼 파일·디렉터리 삭제**

  Run: `cd website && git rm src/components/home/HomeInlineSignatureForm.tsx && git rm -r src/components/home/inline-signature`
  Expected: 7개 파일이 삭제 스테이징됨.

- [ ] **Step 3: `HomeCtaSection.tsx`에서 폼을 `/petition` CTA 버튼으로 교체**

  ```tsx
  // website/src/components/home/HomeCtaSection.tsx
  "use client";

  import { useCallback } from "react";
  import { Heart, PenLine, Share2 } from "lucide-react";
  import { EditableLink, EditableList, EditableText } from "@/components/editable";
  import { AnimatedCounter, FadeIn } from "@/components/home/HomeMotion";
  import { PostmarkStamp } from "@/components/visuals/ForestLetterMotifs";
  import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

  interface HomeCtaSectionProps {
    signatureCount: number | null;
  }

  export default function HomeCtaSection({ signatureCount }: HomeCtaSectionProps) {
    const { getContent } = useAdminEdit();
    const homeShareTitle = getContent("home.share.title") ?? "풍천리를 지켜주세요";
    const homeShareText =
      getContent("home.share.text") ?? "강원도 홍천 풍천리 주민들의 이야기를 들어주세요.";
    const homeShareCopyAlert =
      getContent("home.share.copyAlert") ?? "링크가 복사되었습니다.";

    const handleShare = useCallback(async () => {
      const shareData = { title: homeShareTitle, text: homeShareText, url: window.location.href };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          alert(homeShareCopyAlert);
        }
      } catch {
        /* user cancelled */
      }
    }, [homeShareCopyAlert, homeShareText, homeShareTitle]);

    return (
      <div className="max-w-5xl mx-auto">
        <FadeIn className="relative text-center mb-16 max-w-2xl mx-auto">
          <PostmarkStamp className="absolute -top-6 right-0 w-20 h-20 text-[var(--color-forest)]/35 rotate-12 hidden sm:block" />
          <EditableText
            contentKey="home.cta.heading"
            defaultValue="숲에 답장을 보내주세요"
            as="h2"
            page="home"
            section="cta"
            className="font-serif-display font-bold text-3xl sm:text-4xl md:text-5xl mb-4 text-[var(--color-text)]"
          />
          <EditableText
            contentKey="home.cta.subtitle"
            defaultValue="당신의 이름 하나가 숲을 지키는 국민 연대서명에 힘을 더합니다"
            as="p"
            page="home"
            section="cta"
            className="text-balance text-lg text-[var(--color-text-muted)]"
          />
        </FadeIn>

        {signatureCount !== null && (
          <FadeIn className="mb-8 flex justify-center">
            <div className="stamp-badge inline-block">
              <div className="stamp-badge__inner">
                <EditableText
                  contentKey="home.cta.countPrefix"
                  defaultValue="현재"
                  as="p"
                  page="home"
                  section="cta"
                  className="text-sm text-[var(--color-text-muted)]"
                />
                <p className="font-serif-display font-bold text-4xl sm:text-5xl text-[var(--color-warm)] my-1">
                  <AnimatedCounter target={signatureCount} suffix="명" />
                </p>
                <EditableText
                  contentKey="home.cta.countSuffix"
                  defaultValue="이 함께하고 있습니다"
                  as="p"
                  page="home"
                  section="cta"
                  className="text-sm text-[var(--color-text-muted)]"
                />
              </div>
            </div>
          </FadeIn>
        )}

        <FadeIn className="mb-12 flex justify-center">
          <EditableLink
            contentKey="home.cta.signatureLinkHref"
            defaultHref="/petition"
            page="home"
            section="cta"
            className="letter-btn letter-btn--primary min-h-[48px] px-8"
          >
            <EditableText
              contentKey="home.cta.signatureLinkLabel"
              defaultValue="국민 연대서명 하러 가기"
              as="span"
              page="home"
              section="cta"
            />
          </EditableLink>
        </FadeIn>

        <EditableList
          contentKey="home.cta.cards"
          defaultItems={[
            { title: "서명하기", desc: "양수발전소 건설 반대 서명에 참여해주세요", href: "/petition" },
            { title: "후원하기", desc: "주민들의 법률 비용과 활동을 후원해주세요", href: "/donate" },
            { title: "공유하기", desc: "더 많은 사람들에게 풍천리의 이야기를 알려주세요", href: "#share" },
          ]}
          page="home"
          section="cta"
          fields={[
            { key: "title", label: "제목" },
            { key: "desc", label: "설명", type: "textarea" },
            { key: "href", label: "링크" },
          ]}
        >
          {(items) => {
            const icons = [PenLine, Heart, Share2];
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                {items.map((card, index) => {
                  const IconComp = icons[index] || icons[0];
                  return (
                    <FadeIn key={card.title} delay={index * 0.1}>
                      <div className="hover-lift paper p-8 text-center h-full flex flex-col">
                        <div className="relative z-[1] flex flex-col h-full">
                          <IconComp className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-5" />
                          <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                          <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 flex-1">
                            {card.desc}
                          </p>
                          {card.href === "#share" ? (
                            <button onClick={handleShare} className="letter-btn letter-btn--primary">
                              {card.title}
                            </button>
                          ) : (
                            <EditableLink
                              contentKey={`home.cta.cardLink.${index}`}
                              defaultHref={card.href}
                              page="home"
                              section="cta"
                              className="letter-btn letter-btn--primary"
                            >
                              {card.title}
                            </EditableLink>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            );
          }}
        </EditableList>
      </div>
    );
  }
  ```

  변경점 요약: `HomeInlineSignatureForm` import·렌더 제거, `HomeCtaSectionProps`에서 `onSignatureCountChange` 제거,
  대신 `/petition`으로 가는 `EditableLink` 버튼 1개를 숫자 배지 아래에 둔다. 카드 그리드(서명·후원·공유)는
  그대로 남긴다 — 이건 홈 화면 요약 카드이지 인라인 서명 폼이 아니었고, "서명하기" 카드는 이제 `/petition`
  링크로 정확히 동작한다.

- [ ] **Step 4: `HomeClient.tsx`에서 콜백 배선 제거**

  ```tsx
  // website/src/components/home/HomeClient.tsx (변경 부분만)
  const { signatureCount, toastName, toastVisible } = useHomeSignatureActivity();
  // ...
  <HomeCtaSection signatureCount={signatureCount} />
  ```

  `useHomeSignatureActivity()`가 반환하는 `setSignatureCount`를 더 이상 구조 분해하지 않는다(안 쓰면
  ESLint `no-unused-vars`에 걸린다). `useHomeSignatureActivity.ts` 자체는 내부적으로 `setSignatureCount`를
  계속 쓰므로(초기 fetch 결과 반영) 수정하지 않는다.

- [ ] **Step 5: `check-signature-form-refactor.mjs`가 이미 홈 번들을 안 보는지 확인**

  이 가드의 재작성은 **Task 5가 소유한다**(홈 번들 검사를 들어내고 petition 번들만 남긴다).
  여기서는 삭제된 파일을 아직 `read()`하고 있지 않은지만 확인한다 — 남아 있으면 가드가 예외로 죽는다.

  Run: `cd website && grep -n "HomeInlineSignatureForm\|inline-signature" scripts/check-signature-form-refactor.mjs; npm run signature-form:refactor:check`
  Expected: grep 결과 없음. 가드는 "Signature form refactor checks passed." 출력.

- [ ] **Step 6: 인라인 폼 전용 가드 삭제 + package.json 정리**

  Run: `cd website && git rm scripts/check-home-inline-signature-form-refactor.mjs`
  Expected: 파일 삭제 스테이징.

  ```json
  // website/package.json — scripts에서 아래 줄 제거
  "home-inline-signature:refactor:check": "node scripts/check-home-inline-signature-form-refactor.mjs",
  ```

- [ ] **Step 7: 가드 통과 확인**

  Run: `cd website && npm run home-cta:refactor:check && npm run signature-form:refactor:check`
  Expected: 두 가드 모두 `... checks passed.` 출력, 종료 코드 0.

- [ ] **Step 8: 커밋**

  Run: `cd website && git add -A && git commit -m "$(cat <<'EOF'
  홈 CTA 인라인 서명 폼 제거 — /petition으로 창구 단일화

  이름+이메일만 받던 홈 인라인 폼을 걷어내고 /petition 링크 버튼으로 교체. 관련 가드 재작성. 영향 범위: 홈 CTA 섹션, home-cta·signature-form 가드
  EOF
  )"`
  Expected: 새 커밋 1개, `git status` clean.

---

### Task 15: `/en/petition` 요약형 축소

**Files:**
- Modify: `website/src/app/en/petition/page.tsx` — 전면 재작성(서버 컴포넌트, 요약형)
- Modify: `website/src/app/en/petition/layout.tsx` — 메타데이터 갱신
- Guard Modify: `website/scripts/check-petition-refactor.mjs`

**Interfaces:**
- Consumes: `ShareButtons`(Task 13에서 이미 씀), `EditableText`/`EditableRichText`/`EditableLink`. `PetitionSignatureForm`·`PetitionSuccess`·`englishPetitionFormCopy`·`englishPetitionSuccessCopy`·`englishPetitionShareEditFields`는 더 이상 이 페이지에서 쓰지 않는다(단, `copy/form.ts`·`copy/success.ts`·`copy/share.ts`의 export 자체는 `check-petition-copy-refactor.mjs`가 여전히 요구하므로 지우지 않는다 — 죽은 export로 남는다).
- Produces: 없음(리프 페이지).

- [ ] **Step 1: `check-petition-refactor.mjs`를 새 계약으로 먼저 고쳐 실패시킨다**

  기존 가드는 `/en/petition`이 `PetitionSignatureForm`을 써야 한다고 요구했다. 이제 반대로, 그 컴포넌트를
  쓰지 않고 `/petition`으로 링크만 걸어야 한다고 요구하도록 뒤집는다. 공유 컴포넌트들(`PetitionSignatureForm`,
  `PetitionSuccess`, `PetitionShareEditControls`)의 `copy?` 플러그형 계약 검사는 그대로 남긴다 — 그 컴포넌트들
  자체는 이 Task에서 건드리지 않고, 한국어 `/petition`이 여전히 그 계약에 의존하기 때문이다.

  ```js
  // website/scripts/check-petition-refactor.mjs
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { fileURLToPath } from "node:url";

  const root = fileURLToPath(new URL("..", import.meta.url));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function read(path) {
    return readFileSync(join(root, path), "utf8");
  }

  const copyPath = "src/components/petition/petition-copy.ts";
  assert(existsSync(join(root, copyPath)), "petition locale copy must live in a shared petition-copy.ts module.");

  const copySource = [
    read(copyPath),
    read("src/components/petition/copy/form.ts"),
    read("src/components/petition/copy/success.ts"),
    read("src/components/petition/copy/share.ts"),
  ].join("\n");
  for (const exportName of [
    "koreanPetitionFormCopy",
    "englishPetitionFormCopy",
    "koreanPetitionSuccessCopy",
    "englishPetitionSuccessCopy",
    "koreanPetitionShareEditFields",
    "englishPetitionShareEditFields",
  ]) {
    assert(copySource.includes(exportName), `petition-copy.ts must export ${exportName}.`);
  }

  const formSource = [
    read("src/components/petition/PetitionSignatureForm.tsx"),
    read("src/components/petition/signature-form/types.ts"),
    read("src/components/petition/signature-form/usePetitionSignatureForm.ts"),
  ].join("\n");
  assert(
    formSource.includes("copy?: PetitionSignatureFormCopy"),
    "PetitionSignatureForm must keep accepting a locale copy config (used by /petition).",
  );

  const successSource = read("src/components/petition/PetitionSuccess.tsx");
  assert(
    successSource.includes("copy?: PetitionSuccessCopy"),
    "PetitionSuccess must keep accepting a locale copy config (used by /petition).",
  );

  const englishPage = read("src/app/en/petition/page.tsx");

  for (const banned of [
    "PetitionSignatureForm",
    "PetitionSuccess",
    "PetitionActionCards",
    "englishPetitionFormCopy",
    "englishPetitionSuccessCopy",
    "englishPetitionShareEditFields",
    "usePetitionSignatureSummary",
    "useState",
    "\"use client\"",
  ]) {
    assert(
      !englishPage.includes(banned),
      `/en/petition must stay a static English summary page: found ${banned}.`,
    );
  }

  assert(
    /href=["']\/petition["']/.test(englishPage),
    "/en/petition must link to the Korean petition form at /petition.",
  );

  for (const fact of ["1937", "2017", "111,999", "2,256", "600", "62", "51", "80"]) {
    assert(
      englishPage.includes(fact),
      `/en/petition summary must preserve the source fact: ${fact}.`,
    );
  }

  console.log("Petition refactor checks passed.");
  ```

  Run: `cd website && npm run petition:refactor:check`
  Expected: FAIL — 현재 `/en/petition`은 여전히 `PetitionSignatureForm`을 쓴다.

- [ ] **Step 2: 영문 요약 카피 확정**

  아래 4문단을 그대로 쓴다. 사실·수치는 한국어 성명서(스펙 8절)에서 한 글자도 바꾸지 않았다: 1937년,
  2017년 10대 명품숲/100대 명품숲, 잣 62%, 600MW, 111,999그루, 2,256그루, 51가구, 8년, 왕복효율 약 80%,
  산양·수달(멸종위기 Ⅰ급·천연기념물), 담비(Ⅱ급), EIA·NREL.

  > The pine forest of Pungcheon-ri has stood here since 1937. In 2017, Korea's forest authority named
  > it one of the country's ten finest forests, and it still ranks among the nation's 100 finest forests
  > today. This village produces 62 percent of Korea's domestic pine nuts. Its forest and valley are home
  > to residents who have lived here for generations — and to species the state has pledged by law to
  > protect: the Korean goral and the otter, both Class Ⅰ endangered species and natural monuments, and
  > the yellow-throated marten, a Class Ⅱ endangered species.
  >
  > A 600-megawatt pumped-storage hydroelectric plant is now planned for this site. If it proceeds,
  > 111,999 trees will be cut down; 2,256 have already fallen for a relocation road. Fifty-one households
  > will be flooded out or forced to leave. Residents of Pungcheon-ri have been fighting to protect this
  > forest and village for eight years — most of them elderly people who have lived here their whole
  > lives.
  >
  > Pumped-storage hydro is not a way of generating electricity — it is a way of storing it. Electricity
  > is used to pump water uphill, then released downhill later to generate power again. The U.S. Energy
  > Information Administration (EIA) and the National Renewable Energy Laboratory (NREL) put its
  > round-trip efficiency at roughly 80 percent: about a fifth of the electricity put in is lost in the
  > process of storing and retrieving it.
  >
  > We do not deny that Korea needs energy storage. What we ask for is transparency: is this project
  > truly necessary, what are its real storage gains and losses, how much public money is at stake, and
  > on what legal grounds was it approved? We ask that a way be found to meet the country's storage needs
  > without destroying the forest and valley of Pungcheon-ri. We are not asking for compensation. We are
  > asking that Pungcheon-ri's forest, valley, and the lives within it be left as they are.

- [ ] **Step 3: `/en/petition/page.tsx`를 정적 서버 컴포넌트로 재작성**

  상태·핸들러가 전부 사라지므로 `"use client"`가 필요 없다. `SubHero`·`ShareButtons`·`Editable*`는 클라이언트
  컴포넌트이지만 서버 컴포넌트의 자식으로 그대로 렌더링할 수 있다.

  ```tsx
  // website/src/app/en/petition/page.tsx
  import SubHero from "@/components/SubHero";
  import { EditableLink, EditableRichText, EditableText } from "@/components/editable";
  import ShareButtons from "@/components/ShareButtons";

  const STATEMENT_PARAGRAPHS = [
    `The pine forest of Pungcheon-ri has stood here since 1937. In 2017, Korea's forest authority named it one of the country's ten finest forests, and it still ranks among the nation's 100 finest forests today. This village produces 62 percent of Korea's domestic pine nuts. Its forest and valley are home to residents who have lived here for generations — and to species the state has pledged by law to protect: the Korean goral and the otter, both Class Ⅰ endangered species and natural monuments, and the yellow-throated marten, a Class Ⅱ endangered species.`,
    `A 600-megawatt pumped-storage hydroelectric plant is now planned for this site. If it proceeds, 111,999 trees will be cut down; 2,256 have already fallen for a relocation road. Fifty-one households will be flooded out or forced to leave. Residents of Pungcheon-ri have been fighting to protect this forest and village for eight years — most of them elderly people who have lived here their whole lives.`,
    `Pumped-storage hydro is not a way of generating electricity — it is a way of storing it. Electricity is used to pump water uphill, then released downhill later to generate power again. The U.S. Energy Information Administration (EIA) and the National Renewable Energy Laboratory (NREL) put its round-trip efficiency at roughly 80 percent: about a fifth of the electricity put in is lost in the process of storing and retrieving it.`,
    `We do not deny that Korea needs energy storage. What we ask for is transparency: is this project truly necessary, what are its real storage gains and losses, how much public money is at stake, and on what legal grounds was it approved? We ask that a way be found to meet the country's storage needs without destroying the forest and valley of Pungcheon-ri. We are not asking for compensation. We are asking that Pungcheon-ri's forest, valley, and the lives within it be left as they are.`,
  ].join("\n\n");

  export default function EnglishPetitionPage() {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <SubHero
          imageUrl="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535383_std.jpg"
          imageContentKey="en.petition.hero.image"
          imagePage="en/petition"
          imageSection="hero"
          title={<EditableText contentKey="en.petition.hero.title" defaultValue="We Are the Trees" as="span" page="en/petition" section="hero" />}
          subtitle={<EditableText contentKey="en.petition.hero.subtitle" defaultValue="A national solidarity petition to stop the Pungcheon-ri pumped-storage project and protect its forest and valley" as="span" page="en/petition" section="hero" />}
          eyebrow={<EditableText contentKey="en.petition.hero.eyebrow" defaultValue="National Solidarity Petition" as="span" page="en/petition" section="hero" />}
          variant="emphasis"
        />

        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-10">
          <EditableRichText
            contentKey="en.petition.statement.summary"
            defaultValue={STATEMENT_PARAGRAPHS}
            page="en/petition"
            section="statement"
            renderMode="paragraph"
            className="text-[var(--color-text)] leading-relaxed space-y-4"
          />

          <div className="flex flex-col items-center gap-4 py-4">
            <EditableLink
              contentKey="en.petition.cta.signHref"
              defaultHref="/petition"
              page="en/petition"
              section="cta"
              className="letter-btn letter-btn--primary min-h-[48px] px-8"
            >
              <EditableText
                contentKey="en.petition.cta.signLabel"
                defaultValue="Sign the petition (Korean)"
                as="span"
                page="en/petition"
                section="cta"
              />
            </EditableLink>
            <EditableText
              contentKey="en.petition.cta.note"
              defaultValue="The petition form is in Korean. Your name, region, and message are welcome in any language."
              as="p"
              page="en/petition"
              section="cta"
              className="text-sm text-[var(--color-text-muted)] text-center max-w-md"
            />
          </div>

          <ShareButtons
            title="We Are the Trees — Save Pungcheon-ri"
            page="en/petition"
            section="share"
            contentPrefix="en.petition.share"
            locale="en"
          />
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: `/en/petition/layout.tsx` 메타데이터 갱신**

  ```tsx
  // website/src/app/en/petition/layout.tsx
  import type { Metadata } from "next";
  import type { ReactNode } from "react";
  import { englishAlternates } from "@/lib/seo-alternates";

  export const metadata: Metadata = {
    title: "We Are the Trees — Save Pungcheon-ri",
    description:
      "A national solidarity petition to stop the Pungcheon-ri pumped-storage project. Read the statement in English, then sign the Korean-language petition.",
    alternates: englishAlternates("/en/petition", "/petition"),
  };

  export default function EnPetitionLayout({ children }: { children: ReactNode }) {
    return children;
  }
  ```

- [ ] **Step 5: `PetitionActionCards.tsx`는 여기서 지우지 않는다**

  이 Step은 의도적으로 비어 있다. 실행 순서상 Task 15는 Task 12보다 **먼저** 돌기 때문에,
  이 시점의 `/petition/page.tsx`는 아직 옛 페이지이고 `PetitionActionCards`를 계속 import한다.
  여기서 지우면 `npm run build`가 깨진다. 삭제는 **Task 13 Step 4**가 담당한다.

  Run: `cd website && grep -rn "PetitionActionCards" src/app/en/petition/page.tsx`
  Expected: 출력 없음 — 이 Task가 영문 페이지에서 참조를 걷어냈다는 것만 확인하면 된다.

- [ ] **Step 6: 가드 통과 확인**

  Run: `cd website && npm run petition:refactor:check`
  Expected: `Petition refactor checks passed.` 출력, 종료 코드 0.

- [ ] **Step 7: 커밋**

  Run: `cd website && git add -A && git commit -m "$(cat <<'EOF'
  /en/petition을 요약형으로 축소 — 영문 3필드 폼 제거, 한국어 서명 폼으로 유도

  성명서 요지를 영문 4문단으로 싣고 "Sign the petition (Korean)" 버튼으로 /petition에 연결. 영향 범위: /en/petition, petition:refactor:check 가드
  EOF
  )"`
  Expected: 새 커밋 1개, `git status` clean.

---

### Task 16: 관리자 화면 확장

**Files:**
- Modify: `website/src/lib/data/signatures.ts` — 지역 분포·공개 동의율·중복 후보 추가
- Modify: `website/src/app/admin/signatures/page.tsx` — 위 통계 표시 + CSV 내보내기 링크
- Create: `website/src/lib/csv.ts` — `csvSafeCell`/`toCsvRow`
- Create: `website/src/app/api/admin/signatures/export/route.ts` — CSV 내보내기 라우트

**Interfaces:**
- Consumes: `REGION_TOPS`(`src/lib/regions.ts`, Task 1~12에서 확정), `requireActiveAdmin`(`src/lib/actions/auth.ts`), `logAudit`(`src/lib/actions/audit.ts`).
- Produces: `SignatureStats`에 `regionCounts`·`namePublicRate`·`duplicateCandidates` 필드 추가. `GET /api/admin/signatures/export` — `text/csv` 응답.

- [ ] **Step 1: `getSignatureStats` 확장**

  ```ts
  // website/src/lib/data/signatures.ts (기존 파일에 추가/수정)
  import { REGION_TOPS } from "@/lib/regions";
  // ...기존 import 유지...

  export interface SignatureRegionCount {
    regionTop: string;
    count: number;
  }

  export interface SignatureDuplicateCandidate {
    name: string;
    regionTop: string;
    regionSub: string;
    count: number;
  }

  export interface SignatureStats {
    totalCount: number;
    recentSignatures: { name: string; email: string; message: string | null; createdAt: string }[];
    dailyCounts: { date: string; count: number }[];
    regionCounts: SignatureRegionCount[];
    namePublicRate: number;
    duplicateCandidates: SignatureDuplicateCandidate[];
    usingFallback: boolean;
    warning: string | null;
  }

  export async function getSignatureStats(days = 14): Promise<SignatureStats> {
    const supabase = await createSupabaseServerClient();
    const periodDays = Math.max(1, days);

    const fallback: SignatureStats = {
      totalCount: 0,
      recentSignatures: [],
      dailyCounts: [],
      regionCounts: REGION_TOPS.map((regionTop) => ({ regionTop, count: 0 })),
      namePublicRate: 0,
      duplicateCandidates: [],
      usingFallback: true,
      warning: formatSupabaseRelationWarning("signatures", "서명"),
    };

    if (!supabase) return fallback;

    const since = kstDayStart(new Date(), periodDays - 1);
    const [countResult, recentResult, dailyResult, regionResult] = await Promise.all([
      supabase.from("signatures").select("*", { count: "exact", head: true }),
      supabase
        .from("signatures")
        .select("name, email, message, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("signatures")
        .select("created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
      supabase.from("signatures").select("name, region_top, region_sub, name_public"),
    ]);

    const signatureError =
      countResult.error ?? recentResult.error ?? dailyResult.error ?? regionResult.error;

    if (signatureError) {
      console.error("Failed to fetch signature stats:", signatureError);
      return {
        ...fallback,
        warning: isMissingSupabaseRelationError(signatureError)
          ? formatSupabaseRelationWarning("signatures", "서명")
          : "서명 데이터를 불러오지 못했습니다. Supabase 연결 상태를 확인하세요.",
      };
    }

    const count = countResult.count;
    const recent = recentResult.data;
    const dailyRaw = dailyResult.data;
    const regionRaw = (regionResult.data ?? []) as {
      name: string;
      region_top: string;
      region_sub: string;
      name_public: boolean;
    }[];

    const dailyMap = new Map<string, number>();
    const now = new Date();
    for (let i = periodDays - 1; i >= 0; i--) {
      dailyMap.set(kstDateKey(kstDayStart(now, i).toISOString()), 0);
    }
    dailyRaw?.forEach((row: { created_at: string }) => {
      const day = kstDateKey(row.created_at);
      if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    });

    // 지역 분포: REGION_TOPS 17개를 0으로 먼저 채워, 서명이 없는 지역도 목록에서 사라지지 않게 한다.
    const regionMap = new Map<string, number>(REGION_TOPS.map((regionTop) => [regionTop, 0]));
    let publicCount = 0;
    const duplicateMap = new Map<string, SignatureDuplicateCandidate>();

    for (const row of regionRaw) {
      regionMap.set(row.region_top, (regionMap.get(row.region_top) ?? 0) + 1);
      if (row.name_public) publicCount += 1;

      // 이름+지역 유니크 제약을 걸지 않은 대신(동명이인 차단·명단 벽 통한 참여 여부 노출 방지),
      // 운영자가 훑어서 거를 수 있게 동일 이름+지역 조합만 후보로 모은다.
      const key = `${row.name}|${row.region_top}|${row.region_sub}`;
      const existing = duplicateMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        duplicateMap.set(key, {
          name: row.name,
          regionTop: row.region_top,
          regionSub: row.region_sub,
          count: 1,
        });
      }
    }

    return {
      totalCount: count ?? 0,
      recentSignatures: (recent ?? []).map(
        (r: { name: string; email: string; message: string | null; created_at: string }) => ({
          name: r.name,
          email: r.email,
          message: r.message,
          createdAt: r.created_at,
        }),
      ),
      dailyCounts: Array.from(dailyMap.entries()).map(([date, cnt]) => ({ date, count: cnt })),
      regionCounts: REGION_TOPS.map((regionTop) => ({
        regionTop,
        count: regionMap.get(regionTop) ?? 0,
      })),
      namePublicRate: regionRaw.length > 0 ? publicCount / regionRaw.length : 0,
      duplicateCandidates: [...duplicateMap.values()]
        .filter((candidate) => candidate.count > 1)
        .sort((a, b) => b.count - a.count),
      usingFallback: false,
      warning: null,
    };
  }
  ```

- [ ] **Step 2: `csvSafeCell`/`toCsvRow` 유틸 작성**

  ```ts
  // website/src/lib/csv.ts
  /**
   * 스프레드시트(엑셀·구글시트)가 셀 값을 수식으로 해석하지 않도록 방어한다.
   * =, +, -, @ 로 시작하거나 탭·캐리지리턴으로 시작하는 값은 수식 인젝션에 쓰일 수 있다.
   * 앞에 작은따옴표를 붙이면 대부분의 스프레드시트가 텍스트로 취급한다.
   */
  const DANGEROUS_PREFIX = /^[=+\-@\t\r]/;

  export function csvSafeCell(value: string): string {
    const guarded = DANGEROUS_PREFIX.test(value) ? `'${value}` : value;
    const escaped = guarded.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  export function toCsvRow(cells: string[]): string {
    return cells.map(csvSafeCell).join(",");
  }
  ```

- [ ] **Step 3: CSV 내보내기 라우트 작성**

  `getAdminContext()`는 페이지/레이아웃 전용(권한 없으면 `redirect`를 던진다). API 라우트에서는
  `requireActiveAdmin()`(에러를 반환, 예외를 던지지 않음)을 쓴다.

  ```ts
  // website/src/app/api/admin/signatures/export/route.ts
  import { NextResponse } from "next/server";
  import { logAudit } from "@/lib/actions/audit";
  import { requireActiveAdmin } from "@/lib/actions/auth";
  import { toCsvRow } from "@/lib/csv";

  export const dynamic = "force-dynamic";

  const CSV_HEADERS = [
    "id",
    "이름",
    "공개여부",
    "시도",
    "시군구",
    "소속",
    "이메일",
    "메시지",
    "서명일시",
  ];

  export async function GET() {
    const ctx = await requireActiveAdmin();
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: 403 });
    }

    const { supabase, user } = ctx;
    const { data, error } = await supabase
      .from("signatures")
      .select("id, name, name_public, region_top, region_sub, affiliation, email, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("signatures export: query failed", error.message);
      return NextResponse.json({ error: "서명 데이터를 불러오지 못했습니다." }, { status: 500 });
    }

    const rows = (data ?? []).map((row) =>
      toCsvRow([
        String(row.id),
        row.name,
        row.name_public ? "공개" : "비공개",
        row.region_top,
        row.region_sub,
        row.affiliation ?? "",
        row.email ?? "",
        row.message ?? "",
        row.created_at,
      ]),
    );

    // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 앞에 붙인다.
    const csv = "﻿" + [toCsvRow(CSV_HEADERS), ...rows].join("\r\n");

    await logAudit(supabase, "signatures", 0, "bulk_update", {
      entityKey: "csv_export",
      payload: { exportedCount: rows.length, exportedBy: user.email },
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="signatures-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }
  ```

  CSV 3종 분리를 하지 않는다(스펙 9절: 전체 1종이면 운영자가 스프레드시트에서 필터할 수 있다).

- [ ] **Step 4: `/admin/signatures/page.tsx`에 통계 반영 + 내보내기 링크**

  ```tsx
  // website/src/app/admin/signatures/page.tsx
  import { getSignatureStats } from "@/lib/data/signatures";

  export default async function AdminSignaturesPage() {
    const stats = await getSignatureStats(14);
    const maxDaily = Math.max(...stats.dailyCounts.map((d) => d.count), 1);
    const maxRegion = Math.max(...stats.regionCounts.map((r) => r.count), 1);

    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">서명 현황</h1>
          <a
            href="/api/admin/signatures/export"
            className="rounded-full bg-[var(--color-warm)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            CSV 내보내기
          </a>
        </div>

        {stats.warning && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-800">
            {stats.warning}
            {stats.usingFallback && " 현재 수치는 fallback 상태 기준이며 실제 운영 데이터가 아닐 수 있습니다."}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 sm:p-8 text-center">
            <p className="text-[var(--color-admin-muted)] mb-2 text-lg">총 서명 수</p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-warm)]">
              {stats.totalCount.toLocaleString("ko-KR")}
              <span className="text-lg sm:text-xl md:text-2xl font-normal text-[var(--color-admin-muted)]/70 ml-2">명</span>
            </p>
          </div>
          <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 sm:p-8 text-center">
            <p className="text-[var(--color-admin-muted)] mb-2 text-lg">이름 공개 동의율</p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-forest)]">
              {Math.round(stats.namePublicRate * 100)}
              <span className="text-lg sm:text-xl md:text-2xl font-normal text-[var(--color-admin-muted)]/70 ml-2">%</span>
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6 mb-8 overflow-hidden">
          <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">최근 14일 서명 추이</h2>
          <div className="flex items-end gap-1 h-32 sm:h-40 pb-8">
            {stats.dailyCounts.map((day, i) => {
              const height = maxDaily > 0 ? (day.count / maxDaily) * 100 : 0;
              const dateLabel = day.date.slice(5);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--color-admin-muted)] font-medium">
                    {day.count > 0 ? day.count : ""}
                  </span>
                  <div
                    className="w-full bg-[var(--color-warm)] rounded-t-sm min-h-[2px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <span className={`text-[10px] text-[var(--color-admin-muted)]/70 rotate-[-45deg] origin-top-left translate-y-2 whitespace-nowrap${i % 2 !== 0 ? " hidden sm:inline" : ""}`}>
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6 mb-8">
          <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">지역 분포 (시·도)</h2>
          <div className="space-y-2">
            {stats.regionCounts
              .filter((r) => r.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((region) => (
                <div key={region.regionTop} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-[var(--color-admin-text)]">{region.regionTop}</span>
                  <div className="flex-1 h-3 rounded-full bg-[var(--color-admin-border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-sky)]"
                      style={{ width: `${(region.count / maxRegion) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm text-[var(--color-admin-muted)]">{region.count}</span>
                </div>
              ))}
            {stats.regionCounts.every((r) => r.count === 0) && (
              <p className="text-[var(--color-admin-muted)] text-center py-4">서명 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {stats.duplicateCandidates.length > 0 && (
          <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-amber-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-1">중복 서명 후보</h2>
            <p className="text-sm text-[var(--color-admin-muted)] mb-4">
              동일한 이름·지역 조합이 여러 번 등록됐습니다. 실제 중복인지는 운영진이 판단해주세요.
            </p>
            <div className="space-y-2">
              {stats.duplicateCandidates.map((c) => (
                <div key={`${c.name}-${c.regionTop}-${c.regionSub}`} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-admin-text)]">
                    {c.name} · {c.regionTop} {c.regionSub}
                  </span>
                  <span className="text-[var(--color-admin-muted)]">{c.count}건</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6">
          <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">최근 서명 목록</h2>
          {stats.recentSignatures.length === 0 ? (
            <p className="text-[var(--color-admin-muted)] text-center py-8">서명 데이터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSignatures.map((sig, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-[var(--color-admin-border)] last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-admin-text)]">{sig.name}</p>
                    <p className="text-sm text-[var(--color-admin-muted)]/70">{sig.email}</p>
                    {sig.message && (
                      <p className="text-sm text-[var(--color-admin-muted)] mt-1 line-clamp-2">{sig.message}</p>
                    )}
                  </div>
                  <time dateTime={sig.createdAt} className="text-xs text-[var(--color-admin-muted)]/70 shrink-0">
                    {new Date(sig.createdAt).toLocaleDateString("ko-KR")}
                  </time>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 5: 수동 확인**

  Run: `cd website && npm run dev`으로 로컬 서버를 띄운 뒤 `/admin/signatures`에 관리자로 로그인해 접속.
  Expected: 지역 분포 막대, 공개 동의율, 중복 후보(있을 경우)가 표시되고 "CSV 내보내기" 클릭 시 UTF-8 BOM이
  붙은 CSV가 다운로드된다. 관리자가 아닌 세션으로 `/api/admin/signatures/export`에 직접 GET 요청 시 403.

- [ ] **Step 6: 커밋**

  Run: `cd website && git add src/lib/data/signatures.ts src/app/admin/signatures/page.tsx src/lib/csv.ts src/app/api/admin/signatures/export/route.ts && git commit -m "$(cat <<'EOF'
  관리자 서명 화면에 지역 분포·공개 동의율·중복 후보·CSV 내보내기 추가

  운영진이 연대서명 현황을 지역별로 파악하고 전체 데이터를 CSV로 받을 수 있게 확장. 수식 인젝션 방어와 BOM 부착으로 안전하게 내보낸다. 영향 범위: /admin/signatures, 신규 export API
  EOF
  )"`
  Expected: 새 커밋 1개, `git status` clean.

---

### Task 17: 개인정보처리방침 + 최종 검증

**Files:**
- Modify: `website/src/app/privacy/page.tsx` — 연대서명 수집 항목·명단 공개 항목 추가

**Interfaces:**
- Consumes: 없음(마지막 검증 Task).
- Produces: 없음.

- [ ] **Step 1: `/privacy` 페이지에 연대서명 수집 항목·명단 공개 조항 추가**

  기존 "서명 참여 시" 블록의 수집 항목(이름·이메일·메시지)을 새 필드에 맞춰 갱신하고, 명단 공개에 대한
  별도 안내 블록을 추가한다.

  ```tsx
  // website/src/app/privacy/page.tsx (section1 블록 교체)
  <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] p-5">
    <EditableText
      contentKey="privacy.section1.signupTitle"
      defaultValue="국민 연대서명 참여 시"
      as="h3"
      page="privacy"
      section="section1"
      className="font-semibold text-[var(--color-text)] mb-2"
    />
    <EditableRichText
      contentKey="privacy.section1.signupContent"
      defaultValue="이름 또는 닉네임, 거주 지역(시·도/시·군·구), 소속 단체(선택), 이메일 주소(선택), 제안 한마디(선택)"
      page="privacy"
      section="section1"
      renderMode="paragraph"
      className="text-[var(--color-text-muted)] text-[15px] leading-relaxed"
    />
  </div>
  <div className="bg-[var(--color-bg)] rounded-[var(--radius-card)] p-5">
    <EditableText
      contentKey="privacy.section1.walllTitle"
      defaultValue="서명자 명단 공개"
      as="h3"
      page="privacy"
      section="section1"
      className="font-semibold text-[var(--color-text)] mb-2"
    />
    <EditableRichText
      contentKey="privacy.section1.wallContent"
      defaultValue="이름 공개에 동의하신 분에 한해 이름과 거주 지역(시·도)이 /petition 페이지의 서명자 명단에 공개됩니다. 이메일, 소속, 제안 한마디, 접속 정보는 공개되지 않습니다. 비공개를 선택하셔도 서명은 총 서명 수에 그대로 반영됩니다."
      page="privacy"
      section="section1"
      renderMode="paragraph"
      className="text-[var(--color-text-muted)] text-[15px] leading-relaxed"
    />
  </div>
  ```

  `privacy.header.subtitle`의 "최종 수정일" 기본값도 이번 개편일로 갱신한다(`"최종 수정일: 2026년 8월 28일"`).

- [ ] **Step 2: 정적 검증**

  Run: `cd website && npm run lint`
  Expected: 에러 0건.

  Run: `cd website && npm run build`
  Expected: 빌드 성공, `/petition`·`/en/petition`·`/admin/signatures`·`/privacy` 라우트가 산출물에 포함됨.

- [ ] **Step 3: 영향받는 가드 전부 실행**

  Run: `cd website && npm run petition:refactor:check && npm run petition-copy:refactor:check && npm run petition-form-ui:refactor:check && npm run petition-signature-form:refactor:check && npm run signature-form:refactor:check && npm run signatures-api:refactor:check && npm run security:check && npm run home-cta:refactor:check && npm run failclosed:check && npm run regions:check`
  Expected: 10개 가드 모두 `... checks passed.` 출력, 종료 코드 0. 하나라도 실패하면 Task 9~16 중 해당 가드가
  겨냥하는 파일을 다시 맞춘 뒤 재실행한다.

- [ ] **Step 4: aside 브라우저로 E2E 시나리오 확인**

  로그인 세션이 필요 없는 공개 폼 흐름이므로 `mcp__aside__repl`의 일반 `page`/`browser` 오브젝트로 충분하다.
  아래는 실행할 시나리오를 코드로 정리한 것 — 실제 실행 시 `waitForTimeout`이 없으므로 `waitForSelector`/
  `waitForResponse`로 대체한다.

  ```js
  // aside repl 시나리오 스케치 (실제 실행 시 selector는 렌더된 DOM에 맞춰 조정)
  await page.goto("http://localhost:3000/petition");

  // 1) 정상 제출
  await page.fill("#sig-name", "테스트 참여자");
  // RegionSelect: 시·도 → 시·군·구 순서로 선택
  await page.selectOption('[name="regionTop"]', "강원특별자치도");
  await page.selectOption('[name="regionSub"]', "홍천군");
  await page.check('input[value="public"]'); // 이름 공개
  await page.check("#sig-consent");
  await Promise.all([
    page.waitForResponse((res) => res.url().includes("/api/signatures") && res.request().method() === "POST"),
    page.click('button[type="submit"]'),
  ]);
  // 기대: PetitionSuccess 섹션 노출, SignatureWall에 방금 작성한 이름이 보임

  // 2) 이메일 중복 → 409
  // 같은 이메일로 두 번째 폼 제출을 시도해 409 응답과 에러 문구를 확인한다.

  // 3) 레이트리밋 → 429
  // 같은 IP로 60초 내 6번째 제출을 시도해 429 응답을 확인한다.

  // 4) 필수 필드 누락
  // 이름/지역/공개여부/동의 중 하나를 비운 채 제출해 클라이언트 검증 에러가 뜨고 네트워크 요청이 나가지 않는지 확인한다.

  // 5) "해외" 지역 자유입력
  await page.selectOption('[name="regionTop"]', "해외");
  // 시·군·구가 select에서 자유입력 텍스트필드로 바뀌는지 확인 후 임의 문자열 입력, 제출 성공 확인.

  // 6) 비공개 선택 시 명단 벽 미노출
  // namePublic=false로 제출 후 SignatureWall을 새로고침해도 해당 이름이 보이지 않는지 확인.

  // 7) 명단 벽 "더 보기" 페이지네이션
  // SignatureWall의 "더 보기" 버튼을 클릭해 GET /api/signatures/wall?cursor=... 요청이 나가고 다음 30건이 이어붙는지 확인.
  ```

  Expected: 7개 시나리오 모두 기대한 응답 코드/화면 상태로 끝난다. 실패 시 해당 Task(13 또는 앞선 API Task)로
  돌아가 원인을 고친다.

- [ ] **Step 5: 명단 벽 API 응답에 민감 필드가 없는지 직접 확인**

  Run: `curl -s http://localhost:3000/api/signatures/wall | python3 -m json.tool`
  Expected: 각 항목이 `name`, `regionTop`, `regionSub`, `createdAt` 네 키만 갖는다. `email`, `message`,
  `affiliation`, `ip_hash` 키가 응답 어디에도 없어야 한다.

- [ ] **Step 6: chrome-devtools Lighthouse 모바일 감사**

  chrome-devtools MCP로 `/petition`을 모바일 뷰포트로 열고 Lighthouse를 실행한다.

  ```
  mcp__chrome-devtools__navigate_page → http://localhost:3000/petition
  mcp__chrome-devtools__emulate (모바일 뷰포트 + throttling)
  mcp__chrome-devtools__lighthouse_audit
  ```

  Expected: Performance·Accessibility 점수가 개편 전 기록과 비교해 유의미하게 떨어지지 않는다(특히
  `SignatureWall`의 이미지 없는 텍스트 리스트, `PetitionFAQ`의 `aria-hidden` 토글이 접근성 트리를 어지럽히지
  않는지 확인).

- [ ] **Step 7: 커밋 및 푸시**

  Run: `cd website && git add -A && git status`
  Expected: `src/app/privacy/page.tsx` 변경만 남아 있음(다른 Task들은 이미 각자 커밋됨).

  Run: `cd website && git commit -m "$(cat <<'EOF'
  개인정보처리방침에 연대서명 수집 항목과 명단 공개 조항 반영

  이름·지역·소속·이메일·메시지 수집 항목과 공개 동의자 명단 노출 범위를 명시. 영향 범위: /privacy
  EOF
  )" && git push origin main`
  Expected: 새 커밋 1개, `main`에 푸시 완료, Vercel 자동 배포 트리거.
