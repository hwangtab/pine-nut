# 국민 연대서명 페이지 설계 — 홍천 풍천리 양수발전소 백지화

작성일: 2026-08-28
대상 라우트: `/petition` (기존 서명 페이지 전면 교체)

## 1. 배경과 결정

기존 `/petition`은 이름·이메일·메시지 3필드로 서명을 받아왔다. 이번 국민 연대서명은
성명서 연대라는 성격이 달라 지역·소속·이름 공개 여부를 함께 받아야 하고, 서명자
명단을 공개해 연대의 무게를 드러내야 한다.

확정 사항:

| 항목 | 결정 | 근거 |
|---|---|---|
| URL | `/petition` 유지, 내용 전면 교체 | 기존 유입·SEO 자산 보존, 서명 창구 단일화 |
| 기존 서명 데이터 | CSV 백업 후 전량 삭제 | 운영 판단(소득 없음, 깨끗한 재시작) |
| 명단 공개 | 공개 동의자만 "이름 그대로 + 지역" | 폼의 공개 동의 항목을 실제로 존중 |
| 영문판 | 신규 없음. `/en/petition`은 영문 요약 + 한국어 폼 유도로 축소 | 대상이 국내, 깨진 링크 방지 |
| 목표·마감 | 목표 10,000명, 마감일 없음 | 참여 동기 유지, "마감 후 방치" 회피 |

의도적으로 제외한 것: 마감·자동종료·스냅샷 동결, PII 자동 파기 크론, CSV 3종 분리,
hCaptcha, 서명 확인 메일(Resend 미도입).

## 2. 데이터 모델

새 테이블을 만들지 않고 기존 `signatures` 테이블을 확장한다. 이미 걸려 있는 자산 —
앱/DB 이중 레이트리밋 트리거, `anon` 권한 전면 회수 RLS, service_role INSERT 시
동의값 재검증, 관리자 대시보드 — 이 그대로 살아난다.

### 마이그레이션 `20260828_solidarity_signatures.sql`

```sql
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

최종 컬럼: `id, name, email(NULL 허용), message, created_at, ip_hash,
consent_privacy, consent_age, region_top, region_sub, affiliation, name_public`

### 중복 방지

이메일이 선택 항목이 되면서 기존의 유일한 중복 방지 키가 약해진다. 대응:

- 이메일을 적은 서명 → 부분 유니크 인덱스로 DB가 차단(23505 → 409 응답)
- 이메일을 안 적은 서명 → 기존 IP 레이트리밋(60초 5건, 앱 + DB 트리거 이중)이 차단
- 이름+지역 유니크는 쓰지 않는다. 동명이인이 서명하지 못하고, "이미 서명하셨습니다"
  응답이 명단 공개 페이지에서 타인의 참여 여부를 캐내는 통로가 된다.
- 대신 관리자 화면에 **동일 이름+지역 중복 후보 조회**를 두어 운영으로 거른다.

### 동의 기록

동의 체크박스는 UI상 1개지만 DB에는 `consent_privacy`·`consent_age`를 모두 `true`로
기록한다. 체크박스 문구에 만 14세 조항을 포함시켜, service_role INSERT 정책의
`consent_privacy IS TRUE AND consent_age IS TRUE` 제약을 손대지 않고 재사용한다.

## 3. 삭제 절차 (되돌릴 수 없음)

1. 현재 `signatures` 전량을 CSV로 내려받아 로컬 보관
2. 행 수와 백업 파일 경로를 사용자에게 보여주고 **명시적 확인을 받는다**
3. 확인 후에만 `supabase db push`로 마이그레이션(TRUNCATE 포함)을 원격 적용

## 4. 페이지 구조 (`/petition`)

| # | 섹션 | 구현 |
|---|---|---|
| 1 | 히어로 | `SubHero` 재사용 + `PetitionAnimatedCounter` |
| 2 | 진행률 | 목표 10,000 대비 바 + 총 서명·참여 지역 수·최근 24시간 3지표 |
| 3 | 성명서 | 소제목 4블록, 문단 단위 `EditableText`로 관리자 편집 유지 |
| 4 | 숫자 카드 | 111,999 / 2,256 / 51 / 62% / 8년 |
| 5 | 서명 폼 | 7필드 |
| 6 | 명단 벽 | 공개 동의자, 최신순 30건씩 "더 보기" |
| 7 | 공유 | `ShareButtons` 재사용 + 카카오·문자 템플릿 |
| 8 | FAQ | 아코디언 + `FAQPage` JSON-LD |

FAQ 아코디언은 답변을 DOM에서 제거하지 않고 `aria-hidden`만 토글한다. `FAQPage`
스키마가 "본문에 없는 답변"을 주장하는 상태를 피하기 위함이다.

## 5. 폼 7필드

| # | 필드 | 필수 | 제약 |
|---|---|---|---|
| 1 | 이름 또는 닉네임 | ● | ≤50자 |
| 2 | 거주 지역 | ● | 시·도 select → 시·군·구 select. "해외"는 시·군·구 자유입력 |
| 3 | 소속 단체 또는 모임 | | ≤60자 |
| 4 | 이메일 주소 | | 이메일 정규식. 적으면 중복 방지 키가 됨 |
| 5 | 제안 한마디 | | ≤500자 (현행 100자에서 상향) |
| 6 | 이름 공개 여부 | ● | 라디오 2택 |
| 7 | 동의 | ● | 체크박스 1개 |

지역 데이터는 saf-2026의 `lib/petition/regions.ts`를 복사해 `src/lib/regions.ts`로
가져온다. 17개 시·도와 시·군·구 전체 목록, 조합 화이트리스트 검증(`isValidRegionPair`)까지
검증된 자산이므로 새로 짜지 않는다. 영문 라벨은 제거한다.

## 6. 명단 벽과 개인정보

`GET /api/signatures/wall?cursor=<created_at>`

- `name_public IS TRUE`인 행만 조회, `created_at DESC` 30건씩 커서 페이지네이션
- 응답 필드는 `name, regionTop, regionSub, createdAt` **네 개뿐**.
  `email`, `affiliation`, `message`, `ip_hash`는 응답 스키마에 존재하지 않는다.
- 클라이언트 fetch로만 불러온다(SSR 없음) → 크롤러가 실명을 색인하지 못한다.
- 동의 문구에 "공개에 동의하시면 이 페이지 명단에 이름과 지역이 표시됩니다"를 명시한다.
- `/privacy`에 명단 공개 항목을 추가한다.

## 7. API

### `GET /api/signatures` (확장)
기존 `{ count, recent[] }`에 `regionCount`, `recent24h`, `goal` 추가.
`recent[]`는 명단 벽으로 역할이 옮겨가므로 제거한다.

### `POST /api/signatures` (확장)
`src/lib/signatures/api/validation.ts`에 검증 추가:
- `regionTop`/`regionSub` 조합이 화이트리스트에 있는지 (`isValidRegionPair`)
- `affiliation` ≤60자
- `email`은 있을 때만 정규식 검사
- `namePublic`이 boolean인지 (필수 선택이므로 `undefined` 거부)
- `agreePrivacy === true` (기존)
- `MESSAGE_MAX_LENGTH` 100 → 500

응답 형식(`{ error }` + status)과 에러 매핑(409 중복 / 429 레이트리밋 / 503 Supabase
미설정 / 500)은 기존 구조를 그대로 따른다.

### `GET /api/signatures/wall` (신규)
위 6절 참조.

## 8. 카피

초안의 내용은 유지하되 웹 가독성을 위해 재구성한다. "우리가 나무다" 반복구는
3회 → 2회(히어로·맺음말)로 줄여 힘을 모으고, 문단은 2~3문장으로 쪼개며, 🌲는
히어로 1회만 남긴다. EIA·NREL 인용은 각주로 내려 본문 흐름을 끊지 않는다.
최종본은 `humanize-korean` 스킬로 검증한다.

### 히어로
- eyebrow: 국민 연대서명
- H1: 우리가 나무다
- 부제: 홍천 풍천리 양수발전소 백지화와 숲·계곡 보전을 위한 국민 연대서명
- 리드: 풍천리를 그대로. 숲을 그대로. 생명을 그대로.

### 블록 1 — 1937년부터 여기 있었다
풍천리 잣나무숲은 1937년부터 이 자리에 있었습니다. 산림청은 2017년 이 숲을 10대
명품숲으로 뽑았고, 지금도 대한민국 100대 명품숲에 들어 있습니다.

이 마을은 국내 잣 생산량의 62%를 책임집니다. 숲과 계곡은 몇 세대에 걸쳐 주민들이
살아온 자리이자, 사람 아닌 생명들의 자리이기도 합니다.

멸종위기 야생생물 Ⅰ급이자 천연기념물인 산양과 수달, 멸종위기 Ⅱ급인 담비가 이곳에
삽니다. 국가가 법으로 지키겠다고 한 동물들입니다.

### 블록 2 — 111,999그루
이곳에 600MW 규모의 양수발전소가 추진되고 있습니다. 사업이 진행되면 나무 11만
1,999그루가 사라집니다. 이설도로 공사로 2,256그루는 이미 쓰러졌습니다.

숫자로 적으면 한 줄이지만, 한 그루마다 저마다의 시간이 있습니다. 그 나무에 기대어
사는 것들이 있고, 그것들끼리 얽혀 숲이 됩니다. 11만 1,999라는 숫자 뒤에 있는 건
셀 수 없는 관계와 세월입니다.

물에 잠기거나 집을 떠나야 하는 주민은 51가구입니다. 풍천리 사람들은 8년째 이 숲과
마을을 지키고 있습니다. 그 앞자리에 선 이들은 대개 이 마을에서 평생을 산 노인들입니다.

### 블록 3 — 양수발전이라는 셈법
양수발전은 전기를 만드는 방식이 아닙니다. 전기를 써서 물을 높은 곳으로 끌어올린 뒤,
그 물을 내려보내며 다시 전기를 얻습니다. 발전소라기보다 저장 장치에 가깝습니다.

미국 에너지정보청(EIA)과 국립재생에너지연구소(NREL)는 양수발전의 왕복효율을 약
80%로 봅니다. 넣은 전기의 5분의 1가량이 저장하고 되찾는 과정에서 사라진다는 뜻입니다.

### 블록 4 — 우리가 요구하는 것
전력을 저장할 설비가 필요하다는 것 자체를 부정하지 않습니다. 우리가 요구하는 것은
확인입니다.

이 사업이 정말 필요한지, 실제 저장 효과와 손실은 얼마인지, 공공재원은 얼마나
들어가는지, 법적 판단의 근거는 무엇인지. 투명하게 밝혀주십시오. 그리고 풍천리의
숲과 계곡을 남겨둔 채로 필요한 전력 기능을 확보할 방법을 함께 찾아주십시오.

우리는 보상을 요구하는 것이 아닙니다. 풍천리의 숲과 계곡, 그 안의 생명들이 지금
그대로 남기를 바랄 뿐입니다.

### 맺음말
우리가 나무입니다. 나무도 우리와 함께 사는 생명입니다.

풍천리를 그대로. 숲을 그대로. 생명을 그대로.

### FAQ
1. **이름을 공개하지 않아도 서명할 수 있나요?** 네. 공개 여부와 참여 여부는 별개로
   선택합니다. 공개하지 않음을 고르시면 총 서명 수에만 반영되고 명단에는 나오지 않습니다.
2. **이메일을 꼭 적어야 하나요?** 아닙니다. 이후 보전 활동의 진행 상황을 받아보고
   싶으실 때만 적어주세요. 안내 목적 외에는 쓰지 않습니다.
3. **수집한 정보는 어떻게 쓰이나요?** 연대서명 집계와 성명서 발표, 관련 공론화
   활동에만 씁니다. 목적을 달성하면 파기합니다.
4. **홍천 주민이 아니어도 되나요?** 됩니다. 전국 어디서든, 해외에서도 참여할 수 있습니다.
5. **실수로 두 번 서명했습니다.** 이메일을 적으셨다면 중복은 자동으로 걸러집니다.
   그 외에는 문의처로 알려주시면 정리하겠습니다.

## 9. 관리자 (`/admin/signatures`)

기존 조회 전용 대시보드에 추가:
- 지역 분포(시·도별 집계)
- 이름 공개 동의율
- 동일 이름+지역 중복 후보 목록
- CSV 내보내기 1종(전체). `csvSafeCell`로 수식 인젝션 방어, BOM 부착으로 한글 인코딩 보장

CSV 3종 분리는 하지 않는다. 전체 1종이면 운영자가 스프레드시트에서 필터할 수 있다.

## 10. 영문 페이지 (`/en/petition`)

기존 3필드 영문 폼을 제거하고 요약형으로 축소한다. 성명서 요지를 영문 3~4문단으로
싣고, "Sign the petition (Korean)" 버튼으로 `/petition`에 보낸다.
`defaultEnNavLinks()`의 항목은 그대로 유지된다.

## 11. 건드리는 파일

**신규**
- `website/supabase/migrations/20260828_solidarity_signatures.sql`
- `src/lib/regions.ts`
- `src/app/api/signatures/wall/route.ts`
- `src/lib/signatures/api/wall.ts`
- `src/components/petition/RegionSelect.tsx`
- `src/components/petition/PetitionProgress.tsx`
- `src/components/petition/SignatureWall.tsx`
- `src/components/petition/PetitionStatement.tsx`
- `src/components/petition/PetitionFAQ.tsx`

**수정**
- `src/app/petition/page.tsx` — 전면 재작성
- `src/app/petition/layout.tsx` — 메타데이터 갱신 + `FAQPage` JSON-LD
- `src/app/en/petition/page.tsx` — 요약형으로 축소
- `src/lib/signatures/api/{config,validation,store,demo}.ts`
- `src/lib/signatures/{client,form}.ts`
- `src/components/petition/{petition-copy.ts,PetitionFormFields.tsx,PetitionConsentFields.tsx,PetitionSuccess.tsx,usePetitionSignatureSummary.ts}`
- `src/lib/data/signatures.ts` — 지역 분포 집계 추가
- `src/app/admin/signatures/page.tsx`
- `src/lib/custom-sections/pages.ts` — `petition` 섹션 목록 갱신
- `src/app/privacy/page.tsx` — 명단 공개 항목 추가

**삭제**
- `src/components/petition/RecentSignatures.tsx` — `SignatureWall`이 대체

## 12. 검증

1. `npm run lint`
2. `npm run build`
3. aside 브라우저 E2E — 정상 제출 / 이메일 중복 409 / 레이트리밋 429 / 필수 필드 누락 /
   "해외" 지역 자유입력 / 비공개 선택 시 명단 벽 미노출 / 명단 벽 "더 보기" 페이지네이션
4. 명단 벽 API 응답에 `email`·`message`·`affiliation`·`ip_hash`가 없음을 직접 확인
5. chrome-devtools Lighthouse — 모바일 성능·접근성 회귀 없음

## 13. 계획 수립 중 발견 — 홈 인라인 서명 폼과 가드 스크립트

### 13.1 홈 CTA 인라인 서명 폼 제거

`src/components/home/HomeCtaSection.tsx:96`이 `HomeInlineSignatureForm`(이름+이메일 2필드)을
렌더하고 같은 `POST /api/signatures`로 제출한다. `region_top`/`region_sub`를 NOT NULL로
만들면 이 폼이 즉시 깨진다.

**결정: 홈 인라인 폼을 제거하고 `/petition`으로 보내는 CTA 버튼으로 교체한다.**
서명 창구를 하나로 단일화한다는 전면 교체 결정과 일치하며, 이름+이메일만 받는 폼으로는
연대서명의 요건(지역·이름 공개 동의)을 채울 수 없다.

삭제: `src/components/home/HomeInlineSignatureForm.tsx`,
`src/components/home/inline-signature/` 전체
수정: `src/components/home/HomeCtaSection.tsx`

### 13.2 가드 스크립트

이 저장소에는 테스트 프레임워크가 없다. 대신 `website/scripts/check-*.mjs` 45개가
아키텍처 계약을 강제하며 npm 스크립트로 실행된다(CI 없음, 수동 실행). 이 프로젝트의
TDD는 "가드를 먼저 고쳐 실패시키고 → 구현해 통과시킨다"이다.

이번 변경이 무효화하는 가드와 처리:

| 가드 | 현재 계약 | 처리 |
|---|---|---|
| `check-home-inline-signature-form-refactor.mjs` | 인라인 폼 모듈 분해 구조 | **삭제** (대상 소멸). npm 스크립트도 제거 |
| `check-home-cta-refactor.mjs` | HomeCtaSection이 인라인 폼을 렌더 | **재작성** — `/petition` 링크만 두고 폼 내부 상태가 없음을 단언 |
| `check-petition-refactor.mjs` | `/en/petition`이 `PetitionSignatureForm`·`english*Copy`를 사용 | **재작성** — 영문 페이지는 요약형, 폼 미사용, `/petition` 링크 보유를 단언 |
| `check-petition-copy-refactor.mjs` | `english*Copy` 3종 export 필수 | **재작성** — 영문 폼 카피 요구 제거, 신규 필드 카피 키 요구 추가 |
| `check-petition-form-ui-refactor.mjs` | name/email/message 필드만 | **확장** — region·affiliation·namePublic 단언 추가 |
| `check-petition-signature-form-hook-refactor.mjs` | `PetitionSignatureForm.tsx` ≤120줄 | **확장** — 필드 증가분을 반영해 상한 조정, 신규 상태 키 단언 |
| `check-signature-form-refactor.mjs` | `HomeInlineSignatureForm` 번들 검사 | **재작성** — 홈 번들 제거, petition 번들만 검사 |
| `check-signatures-api-refactor.mjs` | store에 `maskName` 필수 | **확장** — `maskName` 요구 제거(명단 벽은 공개 동의자만 실명 노출), `wall.ts` 모듈·`regionCount`·`recent24h` 단언 추가 |
| `check-signature-security.mjs` | 마이그레이션 RLS·서비스 클라이언트 | **확장** — 명단 벽 라우트가 `email`·`message`·`affiliation`·`ip_hash`를 선택하지 않음을 단언 |

`check-signature-security.mjs`의 기존 단언(anon 정책 회수, `signatures_admin_read`가
`is_active_admin()` 사용, service_role GRANT)은 그대로 통과해야 한다. 새 마이그레이션은
이 정책들을 건드리지 않는다.
