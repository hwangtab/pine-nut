# 관리자 임명·역할 시스템 (Admin Roster & Roles) — 설계 문서

- **작성일**: 2026-06-30
- **대상 프로젝트**: pine-nut (`website/`)
- **상태**: 설계 확정, 구현 계획 작성 예정

## 1. 배경 / 목적

현재 pine-nut은 **역할 개념도 회원/관리자 명부도 없이** "로그인되는 Supabase Auth 계정 = 전권 관리자"
구조다. 관리자 계정은 Supabase 대시보드에서 수동 생성해 왔다. 이를 **명부 기반 + 역할 기반**
시스템으로 바꿔, owner가 사람을 관리자로 임명하고 권한 등급을 부여할 수 있게 한다.

peace 프로젝트의 admin_members + 역할(owner/editor/viewer) 모델을 차용하되, pine-nut 패턴
(App Router + 서버액션 + Supabase + RLS + audit_log)으로 재작성한다. 이메일 발송 시스템은 제외.

## 2. 범위 (확정 사항)

- 모델: **관리자 명부(admin_members) + 역할** (회원 가입형 멤버십 시스템 아님)
- 역할: **owner / editor / viewer (3단계)**, 위계 viewer(1) < editor(2) < owner(3)
- 계정 발급: **이메일만 명부 등록 + 본인 가입(claim)** — owner가 이메일/역할을 명부에 등록하면,
  본인이 `/admin/signup`에서 비밀번호를 설정해 계정을 생성. 이메일 발송 없음.
- 권한 적용: **역할별 콘텐츠 권한 전면 적용** (viewer 읽기전용 / editor 콘텐츠 편집 / owner 전체+명부)
- 부트스트랩: **기존 auth.users 전원을 owner로 승격**(현재 권한 상태 보존, 잠김 방지)

## 3. 동시 작업 경고 (Codex)

구현 시점에 Codex 세션이 같은 리포를 리팩토링 중일 수 있다. 본 기능은 `auth.ts`, 다수 테이블
RLS, 콘텐츠 서버액션 전반, 사이드바, AdminEditContext를 건드리는 **교차 절단·보안 민감** 변경이다.
**구현은 Codex 작업과 시점을 분리**하고(이상적으로 Codex 일시 중지), 마이그레이션은 준비 완료 시점에만
적용한다.

## 4. 데이터 모델

### `admin_members`
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | BIGINT GENERATED ALWAYS AS IDENTITY PK | |
| user_id | uuid NULL | `auth.users(id)`. claim(가입) 시 연결. NULL=등록됐으나 미가입 |
| email | text NOT NULL UNIQUE | 소문자 정규화 저장 |
| display_name | text NULL | |
| role | text NOT NULL DEFAULT 'viewer' | CHECK in ('owner','editor','viewer') |
| active | boolean NOT NULL DEFAULT true | 비활성 시 관리자 권한 상실 |
| created_at | timestamptz NOT NULL DEFAULT now() | |
| updated_at | timestamptz NOT NULL DEFAULT now() | |
| created_by | text NULL | 등록한 owner 이메일 또는 'bootstrap' |

- 인덱스: `email`(UNIQUE), `user_id`.
- **마지막 활성 owner 보호**: 마지막 활성 owner는 강등/비활성/삭제 불가(서버액션에서 잔여 owner 수 검증).

## 5. 권한 강제 (이중 방어)

### 5.1 DB 함수 (SECURITY DEFINER)
`auth.uid()` 및 JWT 이메일 기준으로 평가:
- `is_active_admin()` → `admin_members`에 active로 존재(user_id 또는 lower(email) 매칭)
- `admin_role()` → 'owner'|'editor'|'viewer'|NULL
- `admin_can_edit()` → `admin_role()` ∈ ('owner','editor')
- `is_admin_owner()` → `admin_role()` = 'owner'

함수는 `auth.users`/`admin_members`를 읽으므로 SECURITY DEFINER로 정의하고 `authenticated`에 EXECUTE 부여.

### 5.2 RLS 정책 교체 (신규 마이그레이션)
기존 `TO authenticated USING(true)` 정책을 DROP하고 역할 기반으로 재생성:
- **공개 콘텐츠**(news, timeline_events, page_content, meetings 하위 중 공개 대상 없음 — 회의록은 비공개):
  - SELECT: 공개(`true`) 유지 — 공개 페이지 렌더용.
  - INSERT/UPDATE/DELETE: `admin_can_edit()`.
- **회의록**(meetings + meeting_attendees/agendas/decisions/action_items/attachments): SELECT `is_active_admin()`,
  변경 `admin_can_edit()`.
- **media(storage objects: images, meeting-files)**: 쓰기 `admin_can_edit()` (images public read 유지, meeting-files는 기존 authenticated select → `is_active_admin()`로 강화).
- **signatures / audit_log**: 읽기 `is_active_admin()`, 기존 보안 정책(서명 입력 등)은 유지.
- **admin_members**: SELECT `is_active_admin()`, INSERT/UPDATE/DELETE `is_admin_owner()`.

### 5.3 앱 레벨 게이트
- `getAuthenticatedActionContext()` 확장: 인증 후 `admin_members` 조회. 활성 관리자가 아니면 거부
  (로그인 페이지로 redirect 또는 권한없음). 반환 컨텍스트에 `role` 포함.
- 신규 헬퍼 `requireRole(min: 'viewer'|'editor'|'owner')`: 현재 role이 min 이상인지 검사, 미달 시 거부.
- 콘텐츠 변경 서버액션(news/timeline/page-content/meetings/media) → `requireRole('editor')`.
- 명부 관리 서버액션 → `requireRole('owner')`.
- **UI**: `AdminEditContext`에 role 전달 → viewer는 편집 버튼/액션 비노출(읽기 전용). DB RLS가 최종 방어선,
  UI는 편의·UX.

## 6. 가입(claim) 흐름

`/admin/signup` (신규 페이지):
1. owner가 `/admin/members`에서 이메일+역할(+이름) 등록 → `admin_members`(active=true, user_id=NULL).
2. 본인이 `/admin/signup`에서 **등록된 이메일 + 새 비밀번호** 입력.
3. 서버액션 `claimAdminAccount(email, password)`:
   - 검증: 이메일이 `admin_members`에 active이고 `user_id IS NULL`로 존재하는가. 아니면 거부
     (오픈 가입 차단 / 이미 가입된 이메일 차단).
   - **service role**(`supabase-service.ts`)로 `auth.admin.createUser({ email, password, email_confirm: true })`
     → 생성된 user.id를 `admin_members.user_id`에 연결.
4. `/admin/login`에서 로그인. 로그인 후 비밀번호 변경은 `supabase.auth.updateUser({ password })`로 제공
   (간단한 "비밀번호 변경" UI, v1 선택).
- **보안 핵심**: 계정 생성 전에 명부 검증 → 명부에 없는 이메일은 절대 계정 생성 불가.

## 7. 명부 관리 UI

`/admin/members` (owner 전용, 라우트 진입 시 `requireRole('owner')`):
- 목록: 이메일·이름·역할·활성·가입여부(user_id 유무).
- 추가: 이메일 + 역할 + 이름.
- 역할 변경 / 비활성·재활성 / 삭제.
- **마지막 활성 owner 보호**: 강등·비활성·삭제 시 잔여 활성 owner ≥ 1 보장.
- 사이드바 "기획단(관리자)" 링크 — owner에게만 노출(role 기반 조건부 렌더).

## 8. 부트스트랩 (잠김 방지)

정책을 역할 기반으로 바꾸는 순간 명부에 없는 기존 관리자는 즉시 접근 불가가 된다. 이를 막기 위해:
- 시드 마이그레이션에서 **기존 auth.users 전원을 owner로 admin_members에 삽입**:
  ```sql
  INSERT INTO admin_members (user_id, email, role, active, created_by)
  SELECT id, email, 'owner', true, 'bootstrap' FROM auth.users
  ON CONFLICT (email) DO NOTHING;
  ```
- 근거: 현재 모든 auth 계정은 전권 관리자이므로 owner 승격이 현재 상태를 정확히 보존. PII가 DB 밖으로
  나가지 않음.
- **적용 순서**: ① admin_members 테이블 생성 → ② 부트스트랩 시드(auth.users→owner) → ③ DB 함수 →
  ④ RLS 정책 교체. 이 순서가 한 번에(또는 순번 마이그레이션으로) 보장돼야 잠김이 없다.
- 적용 후 owner가 `/admin/members`에서 불필요한 계정을 강등/비활성.

## 9. 에러처리 / 감사 / 검증

- 서버액션 반환은 기존 `ActionState`(`{error} | null`) 패턴, 친화적 한글 메시지.
- 명부 변경(추가/역할변경/비활성/삭제) 및 claim 시 `logAudit(table_name='admin_members')`.
- 검증: `npm run build` + `npm run lint` 통과. 수동: owner 로그인 → 명부에 editor/viewer 추가 →
  해당 계정 `/admin/signup` 가입 → 로그인 → 역할별 동작 확인(viewer 편집 차단, editor 편집 가능,
  owner만 /admin/members 접근). 마지막 owner 보호 동작 확인.
- 마이그레이션 적용은 **Supabase CLI**(`supabase db push`)로만. 적용 시점은 사용자 승인 후.

## 10. 비범위 (Out of Scope, v1)

- 일반 회원(비관리자) 가입/프로필 시스템.
- 이메일 초대/발송, 비밀번호 재설정 메일.
- 관리자 활동 대시보드/세분 권한(테이블별 커스텀 권한 등).
- 다국어(/en) 관리자 화면.
