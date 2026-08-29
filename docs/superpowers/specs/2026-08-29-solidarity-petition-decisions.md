# SDD ledger — plan: docs/superpowers/plans/2026-08-28-solidarity-petition.md

Spec: docs/superpowers/specs/2026-08-28-solidarity-petition-design.md (읽음)
실행 순서: 1 → 2 → 3 → 4 → 5 → 14 → 15 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 16 → 17
베이스라인(f2d0ead): lint 통과, 가드 10종 전부 PASS

Ruling: 워크트리 대신 피처 브랜치 `feat/solidarity-petition` 사용 — EnterWorktree는 사용자가
명시적으로 요청했을 때만 쓰는 도구이고 기본 baseRef가 origin/main이라 미푸시 상태인 스펙·계획
커밋 3개(4fd9f0c, ab6717b, f2d0ead)가 떨어져 나간다. 브랜치만으로도 main 푸시=Vercel 자동배포
위험은 막힌다. 틀렸을 때 비용: 사용자의 체크아웃이 main 대신 이 브랜치에 있게 됨 — `git checkout main`으로 즉시 원복.

Ruling: Task 2는 정지 지점이다 — 프로덕션 Supabase의 signatures를 TRUNCATE하는 되돌릴 수 없는
작업이고 이 워크스페이스 밖의 공유 자원이다. 백업 CSV 경로와 행 수를 사람에게 보고하고 명시적
확인을 받기 전에는 원격 적용을 실행하지 않는다. 틀렸을 때 비용: 확인 없이 실행하면 서명 데이터가 영구 소실.

## 사전 충돌 스캔

파일·인터페이스를 공유하는 Task 쌍 전수 + 각 Task 자기정합성.

| Task 쌍 | 공유 자원 | 생산 → 소비 | 결과 |
|---|---|---|---|
| 1 → 3,5,7,8 | `src/lib/regions.ts` | `REGION_TOPS`·`subsFor`·`isValidRegionPair`·`OVERSEAS_REGION` | 일치 |
| 2 → 3,4,16 | `signatures` 스키마 | region_top·region_sub·affiliation·name_public, email NULL 허용 | 일치 |
| 2 → 4 | `check-signature-security.mjs` | 2=마이그레이션 단언, 4=명단벽 PII 단언 | 같은 파일 2회 수정. 추가만 하고 순서가 2→4로 고정돼 충돌 없음 |
| 3 → 4 | `check-signatures-api-refactor.mjs` | 3=store·validation 단언, 4=wall 모듈 단언 | 추가만, 순서 3→4 |
| 3 → 5 | `SignatureSummary`, `ValidSignatureSubmission` | 3 생산 → 5 소비 | 일치 |
| 4 → 11 | `WallEntry`·`WallPage`·`fetchSignatureWall` | 4 생산 → 11 소비 | 일치 |
| 5 → 8 | `SignatureFormValues`·`SignatureFormErrors` | 5 생산 → 8 소비 | 일치 |
| 5 ↔ 14 | `check-signature-form-refactor.mjs` | 둘 다 재작성하려 함 | **충돌 — 계획 조립 중 해소.** Task 5 단독 소유, 14는 확인만 |
| 5 → 14 | 홈 인라인 폼 컴파일 | 5가 `SignatureFormValues`에 지역 필드 추가 → 홈 폼 컴파일 불가 | **충돌 — 실행순서 5→14로 해소** |
| 6 ↔ 15 | `english*Copy` | 6이 export 삭제, 15가 참조 끊음 | **충돌 — 실행순서 15→6으로 해소** |
| 6 → 8 | `PetitionSignatureFormCopy` | 6 생산 → 8 소비 | 일치 |
| 7 → 8 | `RegionSelectProps` | 7 생산 → 8 소비 | 일치 |
| 9,10,11 → 12 | `PetitionProgressProps`·`SignatureWallProps`·무인자 컴포넌트 | 생산 → 12가 조립부에서 소비 | 일치(SignatureWallProps에 `refreshToken?: number` 추가로 정합) |
| 12 ↔ 13 | `/petition/page.tsx`, `layout.tsx` | 둘 다 재작성하려 함 | **충돌 — 해소.** 12 소유, 13은 검증만 |
| 11 ↔ 13 | `usePetitionSignatureSummary.ts` | 둘 다 재작성하려 함 | **충돌 — 해소.** 11 소유, 13은 확인만 |
| 11 → 15 | `RecentSignatures.tsx` 삭제 | 15가 en 참조 끊음 | 실행순서 15→11로 해소 |
| 12,15 ↔ 13 | `PetitionActionCards.tsx` 삭제 시점 | 15에서 지우면 옛 `/petition`이 아직 참조 중 → 빌드 붕괴 | **충돌 — 해소.** 삭제를 13으로 이동 |
| 15 → 13 | `check-petition-refactor.mjs` | 15 재작성 → 13이 삭제 단언 추가 | 추가만, 순서 15→13 |
| 2 → 16 | `region_top` 지역 분포 집계 | 2 생산 → 16 소비 | 일치 |
| 17 → 전체 | 최종 검증 | — | 해당 없음 |

각 Task 자기정합성: 17개 전부 확인. 자리표시자(TBD/TODO/"비슷하게") 0건, 각 Task가 생성한다고
선언한 파일과 이후 단계에서 수정하는 파일이 일치. 계획이 명령하는데 리뷰 루브릭이 결함으로
볼 항목(무의미한 단언, 로직 블록 축자 복제) 없음.

스캔에서 나온 충돌 6건은 전부 계획 조립 단계에서 해소됐고 계획 본문에 반영돼 커밋됨(f2d0ead).
실행 전 미해소 충돌 없음.

## 진행

Task 1: BASE f2d0ead, 구현자 a9b76879 → DONE_WITH_CONCERNS, 커밋 d1aa4f1
Task 1: Ruling: `REGION_SUB_MAX_LENGTH = 40`의 단일 출처를 `src/lib/regions.ts`로 정한다 —
  구현자가 `isValidRegionPair` 안에 40을 하드코딩했고 Global Constraints는 같은 값을 Task 3의
  `signatures/api/config.ts`에 두라고 해서 이중 출처가 될 참이었다. regions.ts를 출처로 삼는 이유는
  이 값이 지역 데이터의 성질이고, 반대로 두면 regions.ts가 서명 API 설정에 의존하게 되는데
  클라이언트 폼(Task 5·7·8)도 regions.ts를 쓰기 때문이다. Task 3의 config.ts는 정의 대신 re-export한다.
  틀렸을 때 비용: import 한 줄 방향 변경.
Task 2: Ruling: Task 2를 2a/2b로 쪼갠다 — 2a(마이그레이션 SQL 파일 작성 + check-signature-security.mjs
  확장)는 지금 실행하고, 2b(백업 CSV → 사람 확인 → `supabase db push`)는 Task 17 직전으로 미룬다.
  근거: 2b는 프로덕션 Supabase의 signatures를 TRUNCATE하는 되돌릴 수 없는 작업이라 사람의 확인이
  필요한데, 여기서 막히면 세션 전체가 선다. Task 3·4·16이 실제로 의존하는 것은 마이그레이션 *파일*
  (가드가 파일 내용을 단언한다)이지 원격 DB 상태가 아니고, 로컬 개발환경에는 애초에
  NEXT_PUBLIC_SUPABASE_URL이 없다(CLAUDE.md). 2b는 Task 17의 E2E 전에 반드시 끝나야 한다.
  틀렸을 때 비용: 2b를 잊으면 Task 17 E2E가 스키마 불일치로 실패한다 — 원장과 Task 17 브리프 양쪽에 박아둔다.
Task 1: 리뷰 clean (스펙 ✅, Critical 0, Important 0)
Task 1: minor (deferred): check-regions.mjs의 하드코딩 40 회귀 방지 단언이 `trimmedSub.length <= 40` 리터럴 패턴만 매칭 — 우회 가능하나 실익 낮음
Task 1: minor (deferred): 가드가 regions.ts를 실제 import·실행하지 않고 정적 텍스트 패턴만 검사 — 이 저장소 가드 관례를 따른 것
Task 1: complete (commits f2d0ead..b84f7e7, review clean)
Task 2a: BASE b84f7e7 — 마이그레이션 파일 + 가드만. 2b(백업·확인·push)는 Task 17 직전으로 연기됨.
Task 2a: 리뷰 결과 스펙 ✅ / Approved, 단 Important 1 + Minor 7. 커밋 3b4d77f.
Task 2a: Ruling: 리뷰어가 Minor로 분류한 #2(인덱스 단언이 predicate를 검사하지 않음)를 **Important로 승격**한다 —
  `WHERE email IS NOT NULL AND email <> ''` predicate가 사라지면 `lower(btrim(email))` 유니크 인덱스가
  빈 문자열끼리 충돌해 이메일 없는 두 번째 서명이 23505로 거부된다. 데이터 정확성 실패이고 #1과 같은 부류다.
  fix round 1에 포함. 틀렸을 때 비용: 가드 단언 몇 줄이 필요 이상으로 엄격해짐.
Task 2a: Ruling: Minor #3(공백만 있는 이메일 충돌)을 고친다 — predicate를 `btrim(email) <> ''`로 바꿔
  인덱스 표현식과 일치시킨다. 스펙 본문의 SQL 리터럴에서 벗어나지만, Task 3이 이메일을 선택 항목으로
  바꾸면서 패딩된 빈 문자열을 통과시킬 여지가 생기고 그때 두 번째 무이메일 서명이 거부된다.
  틀렸을 때 비용: 없음 — 인덱스 표현식과 predicate가 같아질 뿐.
Task 2a: Ruling: Minor #5(파일명 8자리)를 14자리로 고친다 — 20260622055905 이후 모든 마이그레이션이
  CLI의 14자리 형식이고, 8자리는 사전순으로는 맞지만 버전을 수치로 비교하는 도구에서 이미 적용된
  마이그레이션보다 앞에 놓인다. 틀렸을 때 비용: 파일명 한 번 더 변경.
Task 2a: Minor #4(재실행 안전성 IF NOT EXISTS 미사용) — deferred. supabase db push가 파일당 트랜잭션으로 감싸고 적용 버전을 기록하므로 노출 낮음.
Task 2a: ⚠️ Task 2b 필수 선행조건 (리뷰 #7): `.gitignore`에 백업 디렉터리 무시 규칙을 **덤프 전에** 추가할 것.
  백업 덤프에는 모든 서명자의 평문 이메일이 들어간다 — 규칙 없이 덤프하면 `git add -A` 한 번에 개인정보가 저장소로 들어간다.
Task 2a: ⚠️ Task 17 배포 창 결합 (리뷰 #8): region_top/region_sub가 NOT NULL이 되는 순간부터
  Task 3+ 앱 배포가 나가기 전까지 모든 서명 제출이 23502로 실패한다. 마이그레이션 적용과 앱 배포는 같은 창에서 이뤄져야 한다.
Task 2a: fix round 1/5 (5 addressed, 0 open — 시·도 CHECK 전수 대조, 인덱스 predicate 전문 검증, btrim(email) predicate, 파일명 14자리, TRUNCATE 인라인 경고; commits 3b4d77f..9dd543d)
Task 2a: minor (deferred): 가드의 regions.ts 파싱과 인덱스 predicate 단언이 현재 소스 포맷(쌍따옴표 리터럴, 공백 정규화된 SQL)에 결합돼 있음 — 요구된 형태이므로 결함 아님
Task 2a: minor (deferred): task-2-report.md 앞부분에 리네임 전 파일명 잔존 — 문서만, 코드 무관
Task 2a: complete (commits b84f7e7..9dd543d, review clean)
  → 마이그레이션 파일 최종 경로: website/supabase/migrations/20260828000000_solidarity_signatures.sql
Task 3: BASE 9dd543d
Task 3: 리뷰 결과 스펙 ✅ / **Needs fixes** — Important 2(둘 다 plan-mandated) + Minor 8. 커밋 3a5e571.
Task 3: Ruling: regionCount의 PostgREST 1000행 상한 문제를 DB RPC로 내린다 —
  `.select("region_top")`이 필터·range·order 없는 전체 스캔이라 서명 1000건을 넘는 순간 조용히
  잘리고, 정렬이 없어 삽입 순서 앞 1000행만 남는다. 즉 초기 1000명의 지역만 영구 반영되고
  "참여 지역 N곳"이 공개 페이지에서 틀린 값으로 굳는다. 목표가 10,000명이라 반드시 지나는 구간이다.
  RPC를 아직 push되지 않은 20260828000000 마이그레이션 파일에 덧붙인다(한 번도 적용된 적 없으므로 안전).
  틀렸을 때 비용: 마이그레이션 파일에 함수 하나가 늘어남.
Task 3: Ruling: 리뷰어가 Minor로 둔 #8(데모 GET이 `demo: true` 플래그 상실)을 이번 라운드에 묶는다 —
  이 diff가 만든 회귀이고 2줄 수정이라 라운드 길이를 늘리지 않는다. 틀렸을 때 비용: 없음.
Task 3: minor (deferred): #3 asOptionalString이 타입 틀린 선택 필드(affiliation·email)를 조용히 삼킴 — 400 대신 "미입력"으로 통과
Task 3: minor (deferred): #4 비문자열 message가 길이 오류 메시지로 거부됨 — 원인과 무관한 안내
Task 3: minor (deferred): #6 CHECK(23514)·NOT NULL(23502) 위반이 매핑 없이 500으로 샘. 현재는 앱 검증이 DB 제약을 정확히 덮어 도달 불가. 부수: responses.ts:31의 console.error가 제약 위반 에러의 details("Failing row contains …이름, 이메일…")를 로그에 남김
Task 3: ⚠️ Task 5 필수: POST 응답이 `{success,count,demo}` → `{success:true}`로 축소됨. client.ts:74-77의
  submitSignature가 count:0을 돌려주고 PetitionSuccess.tsx·usePetitionSignatureForm.ts가 그 count를 쓴다. GET뿐 아니라 POST도 고칠 것.
Task 3: ⚠️ Task 5 필수: 폼이 namePublic을 **boolean으로 직렬화**해야 한다. validation.ts:94-96이
  `typeof body.namePublic !== "boolean"`을 요구하므로 문자열 "true"는 400이 난다.
Task 3: ⚠️ Task 8 필수: PetitionFormFields.tsx:123-125,135가 메시지 상한을 리터럴 `100`으로 하드코딩.
  MESSAGE_MAX_LENGTH를 import하지 않아 500자 상향이 UI에 도달하지 않는다.
Task 3: ⚠️ 향후: check-regions.mjs가 TS 쪽 18개만 단언하고 SQL CHECK 목록과 대조하지 않음.
  (check-signature-security.mjs가 SQL↔TS를 대조하므로 현재는 덮여 있음)
Task 3: fix round 1/5 (3 addressed, 0 open — regionCount RPC 전환, 가드 13개 단언 실계약화, demo:true 복구; commits 3a5e571..8198d0e)
Task 3: minor (deferred): 함수가 schema-qualified 아님(`signature_region_count()` vs 저장소 관례 `public.fn()`)
Task 3: minor (deferred): 가드가 SECURITY DEFINER를 *강제*하는데 유일 grantee가 service_role이라 SECURITY INVOKER로도 동일 — 더 낮은 권한으로 하드닝할 여지를 막음
Task 3: minor (deferred): security 가드의 `security definer`/`set search_path` 단언이 함수명에 앵커되지 않은 전체 파일 includes
Task 3: minor (deferred): `.select("region_top")` 금지가 리터럴 부분문자열 — 작은따옴표·컬럼 추가 변형은 통과
Task 3: minor (deferred): 리포트의 "8개 단언 RED 확인" 주장이 과장 — 실제 13개, 일부는 개별 RED 미확인. 재리뷰어가 13개 문자열이 실제 코드에 바인딩됨을 독립 확인해 계약 자체는 성립
Task 3: complete (commits 9dd543d..8198d0e, review clean)
Task 4: BASE 8198d0e
Task 4: 리뷰 결과 스펙 ❌ / **Needs fixes** — Important 4 + Minor 5. 커밋 d743afa.
  런타임 코드는 유출 경로 없음(select·타입·매핑 세 곳 모두 4필드, name_public 필터가 NULL도 배제,
  N+1 방식 nextCursor 경계 정확, 에러가 고정 메시지로만 나감). 결함은 전부 가드 계층.
Task 4: Ruling: 리뷰어가 Minor로 둔 #5(복합 커서)를 **이번 라운드에 포함**한다 —
  `created_at`은 `now()`=트랜잭션 시작 시각이라 단일 트랜잭션 다행 INSERT(종이 서명 일괄 등록)면
  전 행이 동일 타임스탬프가 되고, 페이지 경계가 그 블록 안에 떨어지면 `.lt("created_at", cursor)`가
  블록 나머지를 통째로 건너뛴다 — 공개 명단에서 이름이 조용히 사라진다. 스펙 본문이 "8년째 보전운동,
  노년 주민 중심"이라 종이 서명 일괄 등록은 충분히 개연적이다. 마이그레이션이 아직 push되지 않아
  복합 인덱스 추가가 지금은 한 줄이다. 틀렸을 때 비용: 커서 코드가 조금 복잡해지고 인덱스 하나가 늘어남.
Task 4: Ruling: Minor #6(isParsableCursor가 주석의 보장보다 약함)·#8(anon 클라이언트 정규식이
  동적 import·경로 변형을 놓침)을 함께 묶는다 — #6은 #5의 커서 변경과 같은 코드고, #8은 보안 단언이라
  한 줄 확장이 값싸다. 틀렸을 때 비용: 없음.
Task 4: minor (deferred): #7 `as WallRow[]` 캐스트가 select 확장을 타입으로 못 막음. created_at이 스키마상 nullable인데 타입은 string
Task 4: minor (deferred): #9 wall route의 에러 문자열이 config.ts 관례를 벗어난 인라인 리터럴 (브리프가 그렇게 지시)
Task 4: ⚠️ 발견: check-production-fail-closed.mjs가 timeline.ts·en/petition/page.tsx·usePetitionSignatureSummary.ts
  세 파일만 읽는다. 새 라우트의 fail-closed는 어떤 가드도 강제하지 않는다.
Task 4: Ruling 정정: 내 수정 지시 #6의 `toISOString()` 커서 정규화는 **틀렸다.** 구현자가 자체 검토에서
  잡아냈다 — Postgres timestamptz는 마이크로초, JS Date는 밀리초 정밀도라 재직렬화하면 마이크로초가
  잘려 복합 커서의 등호 분기(`created_at = C AND id < I`)가 절대 매칭되지 않는다. 채택된 대안:
  Date로 형식·달력 유효성만 검증하고 클라이언트 원본 문자열을 그대로 전달. 구현자 판단이 옳다.
Task 4: fix round 1/5 (7 addressed, 0 open; commits d743afa..26b22f1)
Task 4: minor (deferred): `.or()` 튜플 조건은 Postgres가 인덱스 조건으로 못 쓴다(BitmapOr는 정렬을 공급 못 함).
  인덱스는 ORDER BY만 공급하고 튜플 비교는 Filter로 적용돼 페이지 N이 최신 ~30·N 항목을 다시 훑는다.
  정확성 무관, 목표 10,000명 규모에선 비용 무시 가능. wall.ts:33-34와 마이그레이션 주석의
  "인덱스 스캔만으로" 서술은 과장. `.lte("created_at", parsed.createdAt)`를 `.or()`와 함께 걸면 진짜 keyset seek 복원.
Task 4: minor (deferred): check-signatures-api-refactor.mjs:183-188의 메시지는 WallEntry가 "정확히 4필드"라고
  말하지만 정규식이 `[\s\S]*`라 순서만 고정. camelCase 이름(예: ipHash) 삽입은 어느 가드도 안 잡음
Task 4: minor (deferred): `?cursor=2026-02-31T00:00:00Z|1` 같은 날짜 오버플로가 검증을 통과해 Postgres가 거부 → 잡힌 500.
  wall.ts:49-51 주석의 "달력 유효성" 서술이 약간 과장
Task 4: complete (commits 8198d0e..26b22f1, review clean)

Task 5/14: Ruling: 실행 순서를 **1~4 → 14 → 5 → 15 → 6~13 → 16 → 17**로 다시 조정한다.
  이유: Task 5가 `SignatureFormValues`에 지역 필드를 넣는 순간 홈 인라인 서명 폼이 컴파일되지 않는데,
  그 폼을 지우는 건 Task 14다. 원래 순서(5 → 14)면 그 사이 커밋에서 `npm run build`가 깨진 채로 남는다.
  Task 14는 앞선 Task 산출물에 의존하지 않으므로 5보다 앞당겨도 안전하다.
  틀렸을 때 비용: 없음 — 두 Task는 서로 독립적이다.
Task 5/14: Ruling: `check-signature-form-refactor.mjs`의 **홈 번들 검사 제거 소유권을 Task 5 → Task 14로 이관**한다.
  이 가드는 홈 인라인 폼 파일을 직접 `read()`하므로, Task 14가 파일을 지우면 가드가 예외로 죽는다.
  파일을 지우는 Task가 그 가드도 함께 고치는 게 맞다. Task 5는 petition 번들 단언만 소유한다.
  틀렸을 때 비용: 없음 — 가드 한 파일의 담당 Task가 바뀔 뿐.
Task 14: BASE 26b22f1
Task 14: 리뷰 결과 스펙 ✅ / Approved, 단 Important 1(plan-mandated) + Minor 2. 커밋 4db0e13.
  삭제 완결(잔존 참조 0, 다른 가드가 지운 npm 스크립트를 단언하지 않음 확인), CTA가 letter-btn--primary와
  EditableLink/EditableText 관례를 그대로 따름, useHomeSignatureActivity 죽은 코드 없음.
Task 14: Ruling: Important(`/petition` 링크 단언이 주석·죽은 변수로 우회 가능)를 **수정한다** —
  리뷰어는 "향후 하드닝용, 이 Task를 실패시킬 이유는 아님"이라 했지만, 이 저장소엔 가드 외 테스트가
  없고 같은 부류가 Task 2a·3·4에 이어 네 번째다. 가드 5줄 수정이라 라운드 비용이 낮다.
  틀렸을 때 비용: 정규식이 필요 이상으로 빡빡해져 정당한 JSX 리팩터에 깨질 수 있음.
Task 14: minor (deferred): 홈 화면에 `/petition`으로 가는 동일 스타일 버튼이 둘(새 CTA + 기존 "서명하기" 카드) — 시각적 중복, 후속 UX 정리 대상
Task 14: minor (deferred): 새 CTA에 GA4 클릭 추적 없음 — 기존 형제 링크들도 없어 관례 이탈은 아님. 홈 CTA 퍼널 가시성이 필요하면 analytics.ts에 이벤트 추가 필요
Task 14: fix round 1/5 (1 addressed, 0 open; commits 4db0e13..a736d97)
Task 14: minor (deferred): 진짜 미사용 JSX 요소(`const dead = <EditableLink defaultHref="/petition" />`)는 여전히 가드를 통과 — 완전 차단은 AST 파싱이 필요해 정규식 가드에 과함
Task 14: minor (deferred): `defaultHref={"/petition"}` 중괄호 형태는 가드가 못 잡음 — 수정 전에도 마찬가지였고 현재 코드베이스에 그 스타일 없음
Task 14: complete (commits 26b22f1..a736d97, review clean)

Task 5: BASE a736d97
Task 5: Ruling: Task 5의 범위를 **petition 폼 훅의 상태 객체 최소 갱신까지** 넓힌다 —
  `SignatureFormValues`에 필수 필드(regionTop·regionSub·affiliation·namePublic)가 늘면
  `usePetitionSignatureForm`이 만드는 객체 리터럴이 필드 부족으로 컴파일되지 않는다. 그 훅의 UI 배선은
  Task 8 소관이지만, Task 5 → 15 → 6 → 7 → 8 순서상 그 사이 커밋들이 빌드가 깨진 채 남는다.
  Task 5가 기본값으로 필드만 채워 컴파일을 유지하고, 실제 UI는 Task 8이 만든다.
  대안(새 필드를 optional로 선언)은 계약을 약화시켜 서버 검증과 어긋나므로 택하지 않는다.
  틀렸을 때 비용: Task 8이 어차피 다시 쓸 몇 줄을 Task 5가 먼저 씀.
Task 5: 리뷰 결과 스펙 ❌ / **Needs fixes** — Important 5 + Minor 4. 커밋 35c7d1f.
  본체는 서버 계약 네 접점을 전부 정확히 지킴: namePublic boolean 직렬화, 빈 이메일 null 정규화,
  isValidRegionPair 위임(자체 지역 로직 0줄), 커서의 `+`/`|` encodeURIComponent 왕복 안전.
  구현자가 신고한 우려 (3)(최근 서명이 빈 상태로 남음)은 **이번 Task가 만든 회귀가 아님**을 리뷰어가 확인 —
  구 client.ts도 이미 항상 빈 배열로 파싱했다.
Task 5: Ruling: #3의 `/en/petition` 한국어 에러 노출은 **고치지 않는다** — Task 15가 영문 페이지를
  폼 없는 요약형으로 바꾸므로 이 경로 자체가 사라진다. Task 15가 Task 5 바로 다음이라 노출 창이 없다.
  다만 같은 #3의 죽은 editFields 5개(관리자가 아무 효과 없는 문자열을 편집할 수 있음)는 고친다.
  틀렸을 때 비용: Task 15가 영문 폼을 남기기로 바뀌면 그때 다시 봐야 함.
Task 5: Ruling: #1(영어 개발자 문구 노출)을 **클라이언트 상태코드 분기로** 고친다 — 서버 상수 값을
  바꾸는 쪽이 더 단순하지만, 그 상수들은 서버 로그·개발자 대상으로도 쓰이고 다른 가드가 이름을 단언한다.
  409/429/503만 서버 문구를 신뢰하고 나머지는 한국어 폴백. 틀렸을 때 비용: 분기 몇 줄.
Task 5: Ruling: Minor(죽은 `isValidEmail` export, EMAIL_PATTERN 3중 중복)를 이번 라운드에 묶는다 —
  #1의 client.ts 수정과 인접하고 3줄이라 라운드가 길어지지 않는다. 구현자 자신이 상수 중복을 피하려
  api/config를 쓴 판단과도 모순된다. 틀렸을 때 비용: 없음.
Task 5: minor (deferred): fetchSignatureWall이 entries 원소 형태를 검증하지 않음(Array.isArray만) — fetchSignatureSummary의 필드별 typeof 검사와 비대칭
Task 5: minor (deferred): 성공 화면 count:0 플레이스홀더 — Task 12가 onSubmitted에서 count를 없애면 사라짐
Task 5: minor (deferred): SignatureSummary.demo가 항상 undefined — 읽는 소비처 없어 무해
Task 5: fix round 1/5 (5 addressed, 1 open — **내 지시가 만든 신규 회귀**; commits 35c7d1f..8499ef0)
Task 5: Ruling 정정 (2번째): "409·429·503만 신뢰하고 나머지는 한국어 폴백" 지시가 **틀렸다.**
  서버의 400 응답은 `"거주 지역을 선택해주세요."` 같은 구체적 한국어 사용자 문구인데 화이트리스트에서
  빠지면서 일반 폴백에 덮인다 — 시민이 무엇이 틀렸는지 알 수 없게 된다. 수정 전에는 서버 바디를
  무조건 신뢰해 이 문구들이 잘 나왔고 문제는 영어 500·파싱실패뿐이었다. 지금은 buildValues의
  하드락에 가려져 있으나 Task 8이 UI를 붙이면 드러난다.
Task 5: Ruling 정정 (3번째): "서버 상수 값을 바꾸지 마라 — 가드가 단언한다"는 근거도 **틀렸다.**
  check-signatures-api-refactor.mjs는 상수 **이름**만 단언한다(69·164행). 값 변경은 자유다.
  올바른 해법: 영어 상수 3개 값을 한국어로 바꿔 원천에서 막고, 클라이언트 화이트리스트를 없애
  서버 문구를 다시 신뢰한다. 구체적 문구가 전부 보존된다. 그리고 그 계약을 가드로 고정한다.
  틀렸을 때 비용: 서버 응답 바디 문구가 한국어가 됨(로그는 별도 console.error라 영향 없음).
Task 5: minor→라운드2 포함: client.ts:60-62 네트워크 catch가 예외를 로깅 없이 삼킴 — 이 저장소 다른 에러 경로는 전부 폴백 전 로깅
Task 5: fix round 2/5 (2 addressed, 0 open; commits 8499ef0..4945780)
Task 5: 범위 이탈 1건 판정 — 구현자가 Task 4의 deferred minor(wall route 인라인 영어 리터럴)를 함께 고쳤다.
  재리뷰어 판정: 정당한 인접 정리(같은 버그 부류), 동작 변화는 사용자 개선 방향, Task 4 가드 단언 무파손,
  서버 로그용 영어 문구는 그대로 유지됨. 수용한다.
Task 5: minor (deferred): 한글 포함 가드(`/[가-힣]/`)는 영어 문구에 한글 한 글자만 섞어도 통과 — 내가 지정한 형태라 이탈 아님
Task 5: minor (deferred): "400 문구가 client까지 도달" 검증이 결과 표만 있고 시뮬레이션 스크립트가 없음 — 로직이 6줄이라 문서 갭 수준
Task 5: complete (commits a736d97..4945780, review clean)
Task 15: BASE 4945780
Task 15: 리뷰 clean (스펙 ✅, Critical 0, Important 0). 커밋 7ed98b9.
  금지 사항 2건(PetitionActionCards 삭제 금지, english*Copy export 유지) 준수 확인.
  범위 이탈 3건 전부 정당 판정: (1) check-production-fail-closed.mjs 단언 뒤집기는 보호 범위 축소가 아님 —
  한국어 /petition의 usePetitionSignatureSummary 소비는 여전히 무조건 단언되고 훅의 fail-closed도 그대로.
  (2) 브리프 예시 정규식 버그(`href=`가 `defaultHref=`를 못 잡음)는 실제 버그였음. (3) "51 households" 표기 변경은 사실 무변화.
  영문 카피 12개 사실·수치 전수 대조 일치.
Task 15: minor (deferred): 사실 보존 가드가 단순 부분문자열 — "51"이 "1,551" 안에서도 매칭되고 단위(600-megawatt) 검증 불가. 브리프에서 물려받은 약점
Task 15: minor (deferred): EditableRichText가 브리프 예시의 renderMode="paragraph" 없이 기본 "paragraphs" 사용 — 결과는 동등 이상(문단별 <p>)
Task 15: complete (commits 4945780..7ed98b9, review clean)
Task 6: BASE 7ed98b9
Task 6: 리뷰 결과 스펙 ❌(⚠️·Minor 수준) / **Needs fixes** — Important 2 + Minor 2. 커밋 eb839e7.
  원안 8항목 전수 대조 통과. **명단 벽 실시간 공개 사실이 namePublicNote에 명시돼 있음을 확인** —
  컨트롤러가 Critical로 지정했던 동의 범위 초과는 발생하지 않았다.
  english*Copy 죽은 참조 0, petition-copy.ts 5줄 순수 배럴 유지.
  구현자 우려 3건 전부 정당 판정(2체크박스 절충은 문구상 누락 없음, check-petition-refactor.mjs 수정은 실제 버그 수정).
Task 6: ⚠️ Task 10 필수 (리뷰 Minor 1): 동의 문구가 인용하는 성명서 제목
  「홍천 풍천리 양수발전소 건설 백지화와 풍천리 숲·계곡 보전을 촉구하는 성명서」가 코드베이스 어디에도
  대조할 원본이 없다(PetitionStatement가 아직 없어서). Task 10이 성명서를 만들 때 이 제목과 **정확히 일치**시킬 것.
  동의 문장이 인용하는 문서 제목이 실제와 다르면 동의의 정확성이 훼손된다.
Task 6: ⚠️ Task 12 필수 (구현자 우려 2): src/app/petition/page.tsx의 공유 문구 폴백이 copy/share.ts를
  안 보고 옛 문구("풍천리를 지켜주세요")로 하드코딩돼 있다.
Task 6: ⚠️ Task 8 필수: PetitionConsentFields.tsx가 아직 namePublicLabel/namePublicNote를 렌더하지 않는다.
  명단 벽 공개 고지가 화면에 실제로 뜨게 만드는 건 Task 8이다 — 카피만 있고 렌더가 없으면 고지가 아니다.
Task 6: fix round 1/5 (2 addressed, 0 open; commits eb839e7..2491d06)
  앵커 3건 신설: "하단 명단"(명단 벽 고지) · "목적을 달성할 때까지"(이용 범위) · "14세 이상임을 확인"(연령).
  각 어구가 form.ts에 정확히 1회만 등장하고 죽은 errors.age 문자열과 충돌하지 않음을 재리뷰어가 확인.
  emailNote/emailOptional 분리가 messageOptional 관례와 동일한 형태임도 확인.
Task 6: minor (deferred): TEST 9~11의 RED 증거에 손상 명령(sed 등)이 빠지고 실패 출력만 있음 — 앞선 TEST 1~8보다 엄밀성 한 단계 낮음
Task 6: complete (commits 7ed98b9..2491d06, review clean)
Task 6: ⚠️ Task 8 필수 (재리뷰 out-of-scope 발견, **실제 버그**): PetitionFormFields.tsx:84의 이메일
  `<input>`에 `required`가 붙어 있다. 이메일은 이제 **선택 항목**이다 — 이대로면 이메일을 안 적은
  시민이 브라우저 기본 검증에 막혀 서명을 제출하지 못한다. Task 8이 반드시 제거할 것.
Task 6: ⚠️ Task 8 필수: emailNote·emailOptional·namePublicLabel·namePublicNote가 카피에만 있고
  아무 컴포넌트도 렌더하지 않는다. 특히 emailNote(이용 목적 고지)와 namePublicNote(명단 벽 공개 고지)는
  **화면에 뜨지 않으면 고지가 아니다.** namePublicNote와 동일한 방식으로 라벨 아래 상시 노출할 것.
Task 7: BASE 2491d06
Task 7: 리뷰 clean (스펙 ✅, Critical 0, Important 0). 커밋 91d4890.
  세 분기(일반·세종·해외)가 만드는 (top, sub) 조합이 전부 isValidRegionPair를 통과함을 리뷰어가 직접 재도출.
  스타일 관례 일치(--color-warm은 기존 focus-ring 관례로만 등장, 필드 채움색 아님), 제어 컴포넌트 규율 준수,
  aria-describedby dangling 없음, 범위 침범 0(PetitionFormFields.tsx 무수정).
Task 7: minor (deferred → Task 8 고려): 세종 선택 시 시·군·구 셀렉트가 disabled·포커스 불가 상태로
  이유 설명 없이 놓인다. 노년 사용자에게 "고장난 것"으로 읽힐 수 있다 — "해당 없음" 힌트를 aria-describedby로 붙이는 것 고려
Task 7: minor (deferred): check-region-select.mjs가 정규식 기반이라 무해한 리포맷에 false RED 가능 — 이 저장소 전체 가드의 공통 성질
Task 7: complete (commits 2491d06..91d4890, review clean)
Task 8: BASE 91d4890 — 이월 항목이 많아 구현자를 opus로 띄움
Task 8: 리뷰 결과 스펙 ✅ / Approved, 단 Important 1 + Minor 6. 커밋 fd46b64.
  **이월 항목 9건 전부 렌더된 마크업에서 실제 해결 확인.** 폼이 buildValues()로 진짜 상태를 읽고
  일반·세종·해외 세 분기가 클라이언트·서버 검증을 모두 통과. 명단 벽 고지가 라디오 **위**에 무조건 렌더되고
  두 라디오가 aria-describedby로 가리킴. 동의 체크 1회가 DB 두 컬럼을 확실히 채움(setAgreeConsent 단일 writer).
  가드가 드디어 계약을 검사 — SignatureFormErrors 인터페이스를 파싱해 에러 키 집합 동등성을 양방향 단언하고,
  `regionTop: ""`·`namePublic: null` 하드코딩 복귀를 차단(폼을 다시 벽돌로 만들 바로 그 회귀).
  구현자가 브리프에 없던 결함 2건도 자체 발견·수정(errors.message 렌더 누락, role="radio"에 미지원인 aria-invalid).
Task 8: Ruling: 리뷰어 Minor 중 2건을 이번 라운드에 묶는다 — (a) 소속이 7필드 중 유일하게 선택 표시가 없어
  노년 사용자가 필수로 오인할 수 있다(힌트가 사라지는 placeholder에만 있음), (b) message의 aria-describedby가
  에러 id를 가리키지 않아 dangling id가 남는다. 둘 다 접근성 사안이고 수정이 각각 몇 줄이다.
  틀렸을 때 비용: 없음.
Task 8: Ruling: 라디오·체크박스의 `accent-[var(--color-warm)]`을 **관례로 승인한다** — 기존 동의 체크박스와
  동일하고, 컨트롤의 선택 상태 표시는 필드 채움색이 아니라 액션 어포던스에 가깝다. 두 곳을 함께 두거나 함께 고칠 일이지
  이 Task에서 한쪽만 바꿀 일이 아니다. 틀렸을 때 비용: 나중에 두 곳을 함께 바꿔야 함.
Task 8: minor (deferred): PetitionConsentFields.tsx:39-70의 `<label>` 안 중첩 `<button>` — HTML 콘텐츠 모델 위반이나
  동작상 결함 아님(리뷰어가 표준 근거로 확인: label 활성화가 interactive descendant 이벤트엔 작동 안 하고,
  암묵 라벨 대상은 트리 순서상 먼저인 체크박스). 기존 구조, 범위 밖. 나중에 label 밖 sibling으로 빼면 됨
Task 8: minor (deferred): 개인정보 펼치기 버튼에 aria-controls 없음, 패널에 id 없음. 수집 항목·이용 목적·보유 기간이 접힌 패널 안에만 있음(관례적 패턴)
Task 8: minor (deferred): regionNoSubNote가 다른 두 note와 다른 방식(PetitionFormText)으로 렌더되고 가드가 없음 — 법적 고지 아닌 사용성 보조
Task 8: minor (deferred): count:0 심 잔존 → Task 11/12에서 반드시 걷어낼 것. 성공 화면이 방금 서명한 사람에게 "0명"을 한 순간 보일 수 있음
Task 8: fix round 1/5 (3 addressed, 0 open; commits fd46b64..97524c6)
  가드가 className 상수를 **값까지 해석**하고 해석 불가한 참조는 fail-closed. 조건부 차단을 &&·||·삼항까지 확장.
  구현자가 자체 검토로 결함 하나 더 잡음 — 처음 쓴 dangling-id 단언이 문자열 존재 검사라 죽은 헬퍼 변수에
  문자열이 남아 변이가 GREEN 통과했다. aria-describedby가 참조하는 식만 모아 검사하도록 다시 조임.
Task 8: minor (deferred): 조건부 렌더 검사가 `<p>` 직전 토큰만 봐서, 명령형 if 블록으로 변수에 할당 후
  보간하는 형태는 빠져나감. 이 파일에서 쓰지 않는 스타일이라 가능성 낮음
Task 8: complete (commits 91d4890..97524c6, review clean)

Task 9+10: Ruling: 두 Task를 **한 dispatch로 묶는다** — 둘 다 독립적인 표현 컴포넌트고, 파일이 겹치지 않고,
  공유 상태가 없고, 각각 요약 데이터/카피만 소비한다. 리뷰 사이클 하나를 아낀다.
  Task 11(SignatureWall + 훅 재작성)은 공유 훅을 건드리므로 따로 간다.
  틀렸을 때 비용: 리뷰가 두 컴포넌트를 한 번에 봐야 해 개별 지적의 밀도가 낮아질 수 있음.
Task 9+10: BASE 97524c6
Task 9+10: 리뷰 결과 스펙 ✅✅ / Approved, Important 1 + Minor 2. 커밋 35892f9(진행률), b6dd71b(성명서).
  **제목 일치를 리뷰어가 프로그램적으로 검증** — form.ts의 「」 인용을 추출해 statement.ts와 바이트 단위 동일 확인.
  가드가 두 파일을 check-time에 교차 읽는 방식이라 하드코딩 중복이 아님.
  13개 사실·수치 전수 대조 통과. 사실 앵커 정규식이 단위·문맥 앵커(`/51가구/`·`/2,256그루/`)라
  "51이 1,551 안에서 매칭"되는 부류의 약점이 여기선 재현되지 않음.
  진행률 바 track이 쓰는 `--color-bg-warm`은 CTA 전용 `--color-warm`과 다른 기존 중립 배경 토큰임을 확인 — 색 역할 위반 아님.
  범위 침범 0(page.tsx·SignatureWall·훅·layout 무수정).
Task 9+10: minor (deferred): 111,999가 본문("11만 1,999그루")과 숫자 카드("111,999") 두 곳에 독립 하드코딩.
  현재는 가드 두 단언이 동기를 유지하나 구조적 단일 출처는 아님
Task 9+10: BASE for fix: b6dd71b
Task 9+10: fix round 1/5 (2 addressed, 0 open; commits b6dd71b..e2f0c6e)
  재리뷰어가 ARIA 명세 기준으로 확인 — role="progressbar"에서 aria-valuenow 생략이 표준 불확정 신호가 맞고,
  aria-busy와 병용이 중복·모순 아니며, aria-valuemin/max가 로딩 중 남는 것도 옳다(범위 서술이지 현재값 아님).
  뭉툭한 "loading ? count >= 3" 단언을 4개 정밀 검사로 교체한 것도 커버리지 손실 없음이 확인됨.
Task 9+10: minor (deferred): check-petition-progress.mjs:121-126의 barTag 정규식이 첫 `<div`부터 매칭해
  progressbar 태그만 격리한다는 주석과 달리 이웃 요소까지 포함. 현재는 속성명 앵커 덕에 무해하나 격리 목적은 미달성
Task 9+10: complete (commits 97524c6..e2f0c6e, review clean)

Task 11: BASE e2f0c6e
Task 11: Ruling: Task 11의 범위를 **page.tsx의 컴파일 유지 최소 패치까지** 넓힌다 —
  `usePetitionSignatureSummary`의 반환을 `{summary, loadingSummary, refreshSummary}`로 바꾸면
  현재 page.tsx가 옛 형태를 소비해 컴파일이 깨진다. Task 12(페이지 조립)가 Task 11의 SignatureWall을
  소비하므로 순서를 뒤집을 수 없다. Task 5에서 쓴 것과 같은 패턴이다.
  틀렸을 때 비용: Task 12가 어차피 다시 쓸 몇 줄.
Task 11: Ruling: `count: 0` 심 제거 소유권을 **Task 12**로 확정한다 — 그 심은
  `usePetitionSignatureForm.ts`의 `onSubmitted({name, count})`와 `page.tsx`의 소비부에 걸쳐 있고,
  page.tsx를 실제로 재작성하는 Task가 함께 정리하는 게 맞다. Task 11은 건드리지 않는다.
[중단] 2026-08-29: 사용량 리밋으로 Task 11 dispatch가 취소됨. 재개 시 상태 확인 결과 —
  HEAD e2f0c6e(원장과 일치), SignatureWall.tsx 없음, RecentSignatures.tsx 잔존, 작업트리 clean.
  Task 11은 시작조차 되지 않았음. 위 Task 11 판정 2건 그대로 유효. 동일 dispatch로 재개.
Task 11: 리뷰 결과 스펙 ❌ / **Needs fixes** — Important 1 + Minor 2. 커밋 c3732d2.
  개인정보 4필드 제한, hydration 안전(SSR·첫 렌더 모두 빈 목록), 범위 규율(page.tsx 최소 패치, count:0 심 무수정),
  색 역할 근거(더 보기는 outline-light — PetitionSuccess·error.tsx 선례 확인), 이중 중복 방지 기법
  (loadMoreInFlightRef + generationRef) 전부 확인됨.
Task 11: Ruling: Important(stale 응답 폐기 시 loadingMore가 영구 true) 수정한다 —
  finally 블록의 로딩 상태 리셋이 generation 검사에 함께 갇혀 있어서, "더 보기" 요청 중에 서명을 제출하면
  (refreshToken 변경 → generation 증가) 늦게 온 응답이 데이터는 올바로 폐기되지만 setLoadingMore(false)가
  영영 호출되지 않는다. 결과: 새로 불러온 1페이지에서 "더 보기"가 disabled·aria-busy로 굳어 시민이
  2페이지 이후를 영영 못 본다. 하드 리로드 외엔 복구 불가. **데이터 쓰기만 generation으로 막고
  로딩 상태 리셋은 무조건 하도록** 고친다. 틀렸을 때 비용: 없음 — 폐기된 응답의 데이터는 여전히 안 쓴다.
Task 11: Ruling: Minor(개인정보 가드가 dot-access만 매칭, 대괄호 표기·별칭 변수 누락)를 함께 고친다 —
  이 가드는 동의 범위를 지키는 자리이고 수정이 정규식 한 줄이다. 틀렸을 때 비용: 없음.
Task 11: ⚠️ Task 12 참고: refreshToken 재로드가 실패하면 이미 불러온 항목들이 에러 블록 뒤로 숨는다
  (상태는 남아 있고 재시도 성공 시 복귀). 스펙 위반은 아니나 조립 시 알아둘 것
Task 11: fix round 1/5 (2 addressed, 1 open — **내 지시가 만든 신규 회귀**; commits c3732d2..adecca8)
Task 11: Ruling 정정 (4번째): "로딩 상태 리셋은 무조건"이라는 내 지시가 **너무 뭉툭했다.**
  두 함수의 사정이 다르다 —
  · `handleLoadMore`: 무조건 리셋이 **옳다.** 자기 자신의 중복 실행은 동기 `loadMoreInFlightRef`가 막고,
    자기 generation은 `loadFirstPage`만 올린다. stale 폐기 시 다른 load-more가 진행 중일 수 없다.
  · `loadFirstPage`: 무조건 리셋이 **새 결함을 만든다.** 자기 자신이 겹칠 수 있다(React Strict Mode의
    개발 모드 이펙트 이중 호출, 또는 refreshToken 두 번 변경). A(gen N)가 B(gen N+1)보다 먼저 끝나면
    A의 무조건 리셋이 `initialLoading`을 꺼서, entries가 아직 비어 있으므로 화면에 "아직 서명이 없습니다"가
    잠깐 뜬다. 수정 전의 generation 게이트가 이 경우엔 옳았다 — B가 끝나면서 어차피 리셋하므로 고착도 없다.
  올바른 규칙: **비대칭이다.** loadFirstPage는 게이트 유지, handleLoadMore만 무조건.
  틀렸을 때 비용: 되돌리면 원래 고착 버그가 handleLoadMore에 재발하므로, 비대칭을 정확히 지켜야 한다.
Task 11: fix round 2/5 (1 addressed, 0 open; commits adecca8..e50ce07)
  비대칭 정확히 적용 — loadFirstPage는 게이트 안, handleLoadMore는 게이트 밖. 원래 고착 버그 재발 없음,
  빈 상태 노출 창도 사라짐(entries가 채워진 뒤에야 로딩이 풀림). 양쪽에 비대칭 근거 주석 존재.
  가드가 이름 비의존 구조적 판정(브레이스 중첩 추적)으로 교체됐고 template literal의 ${} 중괄호에 오탐 없음.
Task 11: minor (deferred): stripLineComments가 여전히 /* */ 블록 주석을 안 벗기고 문자열 속 //를 오인할 여지 — 이번 diff 신규 결함 아님(기존 코드), 현재 대상 함수에 블록 주석 없음
Task 11: minor (deferred): isStatementConditional이 감싼 if의 조건이 실제로 generation 동등성 검사인지는 확인 안 함 — 무관한 조건으로 감싸도 통과. 비-AST 가드의 고유 한계
Task 11: complete (commits e2f0c6e..e50ce07, review clean)
Task 12: BASE e50ce07 — 통합 작업이라 구현자를 opus로 띄움
Task 12: 리뷰 결과 스펙 ❌ / **Needs fixes** — Important 2 + Minor 4. 커밋 896c773.
  조립 7섹션 순서 정확, 소비 계약 이름 무변경, 이월 4건 전부 처리, Task 13 소관 3건 미침범 확인.
  **FAQ 5개 답변이 전부 사실임을 리뷰어가 담당 코드를 열어 독립 확인** — 비공개는 명단에서만 제외
  (wall.ts의 name_public 필터 vs store.ts의 무필터 총계), 이메일 선택(form.ts·validation.ts 둘 다 조건부),
  해외 참여(regions.ts + 마이그레이션 CHECK), 중복 방지(부분 유니크 인덱스의 조건절과 정확히 대응).
  공유 문구 단일 출처가 양방향으로 고정된 것(페이지가 리터럴을 못 갖고 편집 칩도 같은 상수)도 확인됨.
Task 12: Ruling: Important 2(요약 조회 실패가 "0"으로 위장)를 **Task 12 수정 라운드에서 고친다** —
  훅은 Task 11 파일이지만 Task 11은 이미 완료됐고, 수정이 훅·페이지·PetitionProgress·PetitionSuccess에
  걸쳐 있어 통합 소유자인 Task 12가 하는 게 맞다. 별도 Task를 여는 것보다 싸다.
  근거: 방금 서명을 마친 시민에게 "감사합니다, ○○님! 0번째로 함께해주셨습니다"가 뜰 수 있다.
  진행률 바의 0보다 이쪽이 더 나쁘다 — 개인에게 "당신의 서명은 0번째"라고 말하는 문장이다.
  틀렸을 때 비용: 훅 계약에 필드 하나가 늘어 Task 11 리뷰 결과와 어긋남(원장에 기록).
Task 12: Ruling: Minor(히어로에서 폼으로 가는 경로 소실)를 함께 고친다 — `PetitionActionCards`를 걷어내면서
  "서명하기" 카드가 사라졌고, `#signature-form` 앵커를 가리키는 링크가 저장소에 하나도 없다(리뷰어 grep 0건).
  시민이 폼에 닿으려면 성명서 전문을 스크롤해야 한다. 노년 사용자에게 실질적 장벽이고,
  청원 페이지에서 서명 경로가 멀어지는 건 그 자체로 결함이다. 틀렸을 때 비용: 히어로에 버튼 하나가 늚.
Task 12: minor (deferred): 제출 직후 refreshToken 증가가 명단을 스피너로 바꿨다가 재로드 실패 시 에러로 — 의식적 트레이드오프로 주석에 기록됨
Task 12: minor (deferred): FAQ가 CMS 밖이라는 제약이 코드 주석에만 있고 운영 문서에 없음
Task 12: minor (deferred): 성공 화면 카운트가 한 프레임 동안 제출 직전 값 — 1왕복 내 자정, 서수 문장이라 실질 오차 1
Task 12: fix round 1/5 (3 addressed, 0 open; commits 896c773..1ad77e0)
  구현자가 검증 중 같은 부류의 두 번째 가드 구멍을 자체 발견 — 질문 존재 단언이 `key={item.q}`만 남아도
  통과했다. 토글 버튼 자식으로 렌더되는지 검사하도록 강화. CTA 스크롤 목표도 formRef(제출 후 null)가 아니라
  폼·성공 화면을 함께 감싸는 안정 래퍼로 잡아 조용히 죽는 걸 막았다.
  훅 계약에 summaryError 추가 — 유일 소비처가 page.tsx뿐임을 확인, stale error 고착 없음(성공 시 해제).
  API 500 상태 실제 제출로 "0번째"가 안 나오는 것 실측.
Task 12: complete (commits e50ce07..1ad77e0, review clean)

Task 13+16: Ruling: 두 Task를 **한 dispatch로 묶는다** — 파일이 겹치지 않고(13은 빌더 섹션 목록 + 죽은 컴포넌트
  삭제, 16은 관리자 데이터 계층 + 화면), 13이 3단계짜리 소품이다. 리뷰는 각각 별도 판정을 받는다.
  틀렸을 때 비용: 리뷰 주의가 분산될 수 있어, 리뷰어에게 두 verdict를 따로 내라고 명시한다.
Task 13+16: BASE 1ad77e0
Task 13+16: 리뷰 결과 스펙 ✅✅ / 둘 다 Approved, 단 Important 2 + Minor 8. 커밋 62dd5e5(13), 1b502e8(16).
  **구현자가 브리프의 버그를 거부한 게 확인됨** — 브리프가 페이지네이션 없는 select 예시를 그대로 줬는데
  (Task 3에서 regionCount를 영구히 틀리게 만든 그 버그) fetchAllRows로 교체했다. 종료 조건·PK 정렬도
  리뷰어가 검증해 누락·중복·무한루프 없음 확인.
  가드가 실행 기반(`await import`로 csvSafeCell을 실제 호출)이고 감사 action 허용값을 마이그레이션에서
  파싱한다 — 이 워크스트림에서 열 번 실패한 "문자열 매칭 가드"와 질이 다르다.
  리뷰어가 csvSafeCell을 18개 입력으로 직접 실행해 9개 필드 + 헤더 전부 방어됨을 확인.
Task 13+16: Ruling: **viewer 역할의 CSV 접근은 그대로 둔다** — 리뷰어 논거를 수용한다.
  RLS `signatures_admin_read`가 `USING (is_active_admin())`이고 anon 키는 공개이므로, viewer는 이미
  자기 세션으로 `GET /rest/v1/signatures?select=*`를 직접 호출해 전체 테이블을 페이징할 수 있다.
  라우트만 editor+로 조이는 건 벽 없는 문에 자물쇠를 다는 셈이다. 이 저장소 관례도 읽기=활성 관리자,
  쓰기=editor+, 멤버십=owner로 일관된다. 대량 PII를 제한하려면 RLS 정책과 함께 바꿔야 하고 그건 별도 과제다.
  **사용자에게 정책 판단으로 보고할 것.** 틀렸을 때 비용: viewer가 전체 서명자 명부를 받아갈 수 있음(단, 지금도 가능).
Task 13+16: minor (deferred): 0건 시·도가 계산은 되나 화면에서 필터됨 — 캠페인 운영엔 "아직 0인 시도"가 행동 가능한 정보
Task 13+16: minor (deferred): 중복 후보 목록 무제한 — 한계 안내 문구는 있음
Task 13+16: minor (deferred): 51개 가드 중 자동 실행되는 게 없음(집합 스크립트·CI 부재) — 저장소 전체 사안
Task 13+16: ⚠️ Task 17 필수: 마이그레이션 적용 후 `/admin/signatures`와 CSV 내보내기를 **실제로 한 번** 실행해볼 것.
  Supabase 클라이언트가 untyped라 tsc/build가 9개 컬럼명·행 타입·RLS를 하나도 검증하지 못한다.
  리뷰어가 마이그레이션을 직접 읽어 컬럼·타입·CHECK·RLS·grant 체인을 확인했으나 런타임 검증은 남아 있다.
Task 13+16: fix round 1/5 (7 addressed, 0 open; commits 1b502e8..e990903)
  logAudit이 Promise<boolean>으로 바뀌었으나 저장소 전체 호출부 ~25곳이 전부 bare await 문장이라 무파손 확인.
  fail-closed 순서도 정확 — truncated 검사 → 감사 검사(CSV 바디 생성 전 return) → CSV 생성 → 응답.
  truncated 플래그가 CSV 라우트(500)와 getSignatureStats(warning) 양쪽에서 소비됨, 무시 경로 없음.
Task 13+16: minor (deferred): 권한 가드 정규식이 리터럴 토큰 순서에 고정 — 인자 순서 교체나 throw 방식 구현에 false RED 가능(과엄격 방향)
Task 13+16: minor (deferred): fetchAllRows가 행 수가 MAX_PAGINATED_ROWS의 정확한 배수일 때 false-positive truncated 가능 — 10배 여유라 실질 무영향
Task 13: complete (commit 62dd5e5, review clean)
Task 16: complete (commits 1b502e8..e990903, review clean)

Task 2b: 시작. 순서 — .gitignore 규칙 먼저 → 백업 → 사람 확인 → 원격 적용.

Task 2b: **사용자가 결정을 변경했다** — 백업 65건(2026-03-10~08-28)을 보여드린 뒤 "전량 삭제" → "보존"으로 바뀜.
  백업 완료: signature-backups/signatures-2026-08-29.sql (194KB, gitignore 확인됨, signatures 65행 +
  admin_members·audit_log·board_posts·meetings·news·page_content·timeline_events 포함).
Task 2b: 내 실수 기록: 행 수 계산 스크립트의 파싱 버그(`) VALUES` 대신 실제로는 `) OVERRIDING SYSTEM VALUE VALUES`)로
  indexOf가 -1을 반환해 slice가 파일 전체가 됐고, **서명자 이름·이메일·IP 해시가 터미널에 출력됐다.**
  사용자에게 보고함. 재계산은 숫자만 출력하도록 고침.
Task 2b: Ruling: 기존 65건 보존을 위해 **`'미상'` 센티넬을 CHECK에 추가하고 백필한다.** 대안 비교 —
  · NULL 허용: region_top/region_sub를 nullable로 → DB의 NOT NULL 방어를 잃는다. 앱 검증만 남는다.
  · 18개 시·도 중 하나로 백필: 거짓 데이터가 된다. 지역 분포가 오염된다.
  · `'미상'` 센티넬(채택): NOT NULL 유지, "모른다"가 명시적, `isValidRegionPair`가 거부하므로 폼은
    절대 이 값을 만들 수 없다. `signature_region_count()`에서 제외해 "참여 지역 수"를 오염시키지 않는다.
    관리자 지역 분포에는 별도 행으로 보여 운영자가 "지역 정보 없는 기존 서명 65건"을 인지한다.
  틀렸을 때 비용: CHECK에 값 하나가 늘고, 집계 쿼리에 제외 조건 한 줄이 붙는다.
Task 2b: ⚠️ 발견: id=1이 테스트 행이다('테스트' / test@example.com / consent_privacy·consent_age 모두 false).
  공개 카운터를 1 부풀린다. 삭제는 사용자가 방금 거절한 행위라 임의로 지우지 않고 보고만 한다.
Task 2b(마이그레이션 전환): 리뷰 결과 스펙 ✅ / Approved, Important 1 + Minor 4. 커밋 3231d33.
  **두 Critical 실패 모드 모두 닫힘이 확인됨** — (1) 65건 손실: 백필이 SET NOT NULL보다 앞이고,
  RLS force 없음·레이트리밋 트리거는 BEFORE INSERT 전용·테이블 CHECK 재검증 없음이라 UPDATE가 중단될
  경로가 없다. 새 부분 유니크 인덱스는 기존 non-partial UNIQUE의 진부분집합이라 충돌 불가.
  (2) 레거시 서명자의 무단 공개: name_public NOT NULL DEFAULT false + 명단 벽의 .eq("name_public", true)로 차단.
  `'미상'` 예외가 정확히 한 값만 허용함을 리뷰어가 우회 시도로 확인(엉뚱한 값 대입·중복 모두 18개 검사에서 걸림).
Task 2b: Ruling: Important(namePublicRate가 레거시 65건으로 희석)를 고친다 —
  출시 첫날 새 서명 5건이 전부 공개 동의해도 5/70 = **7%**로 보인다. 운영자가 "동의 체크박스가 고장났나"
  하고 오판한다. 지역 분포에서 고친 것과 정확히 같은 부류가 한 칸 옆에 남았다.
  틀렸을 때 비용: 분모 정의가 바뀌어 과거 수치와 비교 불가(단, 과거 수치에 의미가 없다).
Task 2b: Ruling: Minor 3건 함께 고친다 — (a) TRUNCATE 부재 단언이 `DELETE FROM signatures`는 못 막는다
  (같은 데이터 손실인데 철자만 다름), (b) `signature_region_count()` 제외 단언이 함수 본문에 앵커되지 않아
  주석이나 `OR true`로 우회 가능, (c) 중복 후보 키가 레거시 65건을 전부 `이름|미상|`로 뭉쳐 동명이인을
  거짓 중복으로 올린다(지역이 판별자였는데 사라짐). 전부 같은 파일들, 각 몇 줄.
Task 2b(마이그레이션 전환): fix round 1/5 (4 addressed, 0 open; commits 3231d33..83ccd5a)
  askedCount 0일 때 0으로 나누기 없음, 캡션이 분모를 정확히 설명, duplicateMap 제외가 다른 통계를 오염시키지
  않음(루프 순서 확인), DELETE FROM 단언이 기존 20260314의 정당한 중복정리 DELETE를 오탐하지 않음
  (가드가 solidarity 파일만 읽음). 레거시 중복 누락 대가도 작음 — 기존 이메일 유니크 인덱스로 동일 이메일
  중복이 이미 0건이고, 이름만으로 판별하면 오탐이 더 커진다.
Task 2b: 마이그레이션 파일 준비 완료. **원격 적용은 아직 안 함.**
Task 2b: ⚠️ 배포 창 결합 (Task 2a 리뷰에서 이미 기록됨, 여기서 재확인):
  region_top/region_sub가 NOT NULL이 되는 순간부터 **현재 배포된 구 코드**의 서명 제출이 23502로 실패한다.
  반대로 새 코드를 먼저 배포하면 없는 컬럼을 insert해 실패한다. 어느 방향이든 창이 생긴다.
  → 마이그레이션 적용과 main 푸시를 **연달아** 하고, 그 사이를 최소화해야 한다. 시점은 사용자가 정할 일.
Task 17: BASE 83ccd5a — 범위를 로컬에서 가능한 것으로 한정한다(개인정보처리방침 + lint/build/가드 52종).
  마이그레이션 적용·E2E·푸시는 컨트롤러가 사용자와 함께 컷오버로 처리한다.
Task 17: 리뷰 결과 스펙 ✅ / Approved, Important 1 + Minor 2. 커밋 5b3413d. 가드 52/52 통과.
  **방침 서술을 항목별로 실제 코드와 대조해 전부 일치 확인** — 수집 항목(validation.ts), 명단 공개 필드
  (wall.ts의 select + SignatureWall.tsx:165가 regionTop·regionSub 둘 다 렌더), 비공개도 총계에는 반영
  (store.ts에 name_public 필터 없음), IP 해시·원본 미저장(request.ts의 sha256), 이용 목적·보유 기간·만 14세.
  **구현자가 브리프 초안의 오류를 잡았다** — 초안은 "시·도"만 공개된다고 했으나 실제로는 시·군·구까지 나간다.
  방침이 실제보다 좁게 서술되는 것을 막았다. 이게 이 Task의 존재 이유였다.
  신규 privacy-policy:check가 내용 단언(fetchSignatureSummary 본문을 중괄호 매칭으로 파싱해 name_public
  부재 확인, WallEntry 필드 집합, hashIp의 sha256 등)이고, run-all-checks가 package.json에서 동적 발견해
  "52/52"가 누락 없는 수치임도 확인됨.
Task 17: Ruling: Important(`/en/privacy` 낡음)를 **고친다** — 리뷰어 판정대로 Critical은 아니다
  (서명 경로가 한국어 전용이고 실제 동의 문구는 정확하다). 하지만 `/en/privacy`는 푸터·네비로 독립 접근
  가능한 라이브 법률 문서이고, 지금 "이름·이메일·선택 메시지"만 수집한다고 말하며 **명단 공개를 아예
  언급하지 않는다.** 국문 내용이 이미 정확하니 번역만 하면 되는 값싼 수정이다.
  틀렸을 때 비용: 영문 문구 몇 문단.
Task 17: fix round 1/5 (3 addressed, 0 open; commits 5b3413d..cba4882)
  국문↔영문 항목별 대조 전부 일치(리뷰어가 두 페이지를 직접 읽어 확인). 명단 공개 범위가 두 언어에서
  동일하게 시·도+시·군·구를 말하고, 영문이 실제보다 좁게 서술하지 않음. antiAbuse 서술도 store.ts의
  실제 60초 창과 일치.
Task 17: minor (deferred): check-privacy-policy.mjs §8의 국문·영문 상호 anchoring 단언이 **죽은 코드**다 —
  앞선 두 무조건 단언이 이미 양쪽을 true로 강제하므로 `true === true`가 되어 절대 실패할 수 없다.
  리포트가 이걸 "가장 신경 쓴 부분"이라 서술했으나 실제로 회귀를 잡은 건 앞선 단언이다. 기능적 해는 없음.
Task 17: complete (commits 83ccd5a..cba4882, review clean)

=== 17개 Task 전부 완료. 전체 브랜치 리뷰로 진행 ===
브랜치 규모: 커밋 34개(merge-base f2d0ead), 파일 74개, +6093/-1810
미적용 상태: 마이그레이션 원격 미적용, main 미병합, 미푸시

=== 전체 브랜치 리뷰 (opus, 6패스) — Ready to merge: With fixes ===
Critical 1건 + Important 6건 + Minor 8건. 이월 항목 판정도 함께 받음.

Critical: 마이그레이션의 region_top/region_sub에 **DEFAULT가 없다.** 현재 배포된 구 코드의 INSERT는
  이 두 컬럼을 안 보내므로(f2d0ead의 store.ts 확인) NOT NULL이 걸리는 순간 전부 23502 → 500.
  `supabase db push` 완료부터 Vercel 배포 완료까지 **모든 서명 제출이 실패한다.** 롤백 경로도 없다.
  `ALTER COLUMN region_top SET DEFAULT '미상', region_sub SET DEFAULT ''` 두 줄이면 창이 사라지고
  롤백 안전망까지 생긴다('미상'은 이미 CHECK 허용값이고 가드 52/52도 그대로 통과함을 리뷰어가 확인).
  **이건 계획 자체의 결함이다** — 계획이 db push를 Task 2에, 코드 푸시를 Task 17에 두면서
  그 사이의 스키마-코드 결합을 한 번도 언급하지 않았다. Task 2를 정지시킨 내 판단이 사고를 막았지만
  그건 다른 이유(TRUNCATE) 때문이었고 결합 자체는 아무도 다루지 않았다.

이월 항목 판정:
  · max_rows 잔여 → **해결됨**(세 경로 전부 fetchAllRows + truncated 플래그). 남은 건 성능이지 정확성 아님
  · 가드 자동 실행 없음 → **Important로 승격.** 이 브랜치가 가드를 개인정보 노출 경계의 유일한 장치로
    만들었으므로 판정이 바뀐다. GitHub Action 15줄
  · viewer CSV 접근 → **판정 유지.** 다만 그 우회로가 감사 기록도 함께 우회한다는 사실을 라우트 주석에 남길 것
  · id=1 테스트 행 → 판정 유지

=== 최종 수정 물결 재리뷰 (opus) — 배포 가능한가: No ===
Critical 1 + Important 2~6 + 작은 것 9종 전부 ADDRESSED, 범위 이탈 없음.
마이그레이션이 프로덕션 65건 위에서 문장별로 성공함을 리뷰어가 위→아래 추적으로 확인.
DEFAULT 가드를 9종 변형으로 시험해 6종 CAUGHT(삭제·주석위장·값변경·한쪽만제거·CHECK뒤이동·백필앞이동).

Ruling 정정 (5번째): **홈 토스트를 복원하라는 내 판정이 새 고지 결함을 만들었다.**
  같은 물결의 커밋 414019a가 동의 질문을 열거형으로 다시 썼다 — "이 페이지의 서명자 명단과 향후
  성명서·서명 결과 발표 자료에 공개". 국·영문 방침도 "/petition 페이지 하단"으로 장소를 특정하고
  국문은 "이메일·소속·제안 한마디·접속 정보는 공개되지 않습니다"라는 배타 열거까지 붙인다.
  바로 다음 커밋 fdf39c1이 그 이름을 **홈 첫 화면 토스트에 마스킹 없이** 내보낸다.
  고지 넷 어디에도 "홈"이 없다(grep 히트 0). 새로 만든 고지 정합 가드도 정확히 이 구멍만 비켜 간다.
  → 즉 이 물결이 Important 2에서 "열거형 고지가 실제보다 좁으면 결함"이라는 원칙을 세우고
  Important 5에서 스스로 위반했다. **내가 복원을 판정했으므로 내 책임이다.**
  해법: 고지 셋 + 동의 질문에 홈 알림 창구를 명시하고 가드에 앵커한다(토스트 철회 대신).
  근거 — 노출되는 이름은 이미 같은 동의 게이트를 통과한 부분집합이고 비동의자는 한 명도 안 나간다.
  고지만 맞추면 정합이 완성되며 편집 4곳 + 단언 1~2개다. 틀렸을 때 비용: 문장 몇 개.
Ruling: 마이그레이션 13행·admin/signatures/page.tsx:112의 "18개 시·도" 오기를 고친다 —
  구현자가 "Critical 파일이라 diff 최소화"로 남겼으나 같은 커밋이 이미 그 파일에 8행을 추가했고,
  **원격 적용 전인 지금이 마지막으로 싼 순간**이다. 같은 물결이 signatures.ts의 동일 오기는 고쳤다.
  틀렸을 때 비용: 없음(주석).
