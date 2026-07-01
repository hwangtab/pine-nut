# 가입 우선 + 명단 선정 방식 전환 Implementation Plan

> 실행: subagent-driven, 태스크별 리뷰. 보안 민감(가입 게이트 → 오픈 가입).

**Goal:** 관리자 임명 흐름을 "초대 우선(owner가 이메일 등록→본인 가입=즉시 관리자)"에서 "**가입 우선**(누구나 가입→role=pending 무권한→owner가 명단에서 역할 부여)"으로 전환.

**핵심 원칙:** pending 계정은 로그인은 되지만 관리자 권한 0 (is_active_admin=false, /admin 접근·데이터 열람·편집 전부 불가). owner가 `/admin/members` 명단에서 역할을 줘야 관리자가 됨.

## Global Constraints
- `website/`에서 실행. 마이그레이션 적용은 CLI(`supabase db push`), 사용자 승인 후.
- 기존 owner(admin@pungcheonri.kr, role=owner)는 전환 후에도 관리자 유지(잠김 없음) — is_active_admin 재정의가 owner/editor/viewer 포함하므로 안전.
- 검증: `npm run build` + `npm run lint`. 커밋 한국어, `git add`는 해당 파일만.
- 오픈 가입 남용(스팸)은 v1 수용(대기계정 권한0). rate-limit은 후속.

## Task A: 마이그레이션 — pending 역할 + is_active_admin 재정의
Create `website/supabase/migrations/20260701010001_signup_first_pending_role.sql`:
```sql
-- role에 'pending' 추가(가입 직후 무권한 대기 상태), 기본값 pending
ALTER TABLE public.admin_members DROP CONSTRAINT IF EXISTS admin_members_role_check;
ALTER TABLE public.admin_members
  ADD CONSTRAINT admin_members_role_check CHECK (role IN ('owner','editor','viewer','pending'));
ALTER TABLE public.admin_members ALTER COLUMN role SET DEFAULT 'pending';

-- is_active_admin: pending은 관리자 아님(실제 3역할만 관리자)
CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND m.role IN ('owner','editor','viewer')
      AND (m.user_id = auth.uid()
           OR lower(m.email) = lower(auth.jwt() ->> 'email'))
  );
$$;
```
검증: `grep -c "pending" 파일` ≥ 3. 커밋: "가입우선 전환 마이그레이션: pending 역할 추가 + is_active_admin 재정의".

## Task B: 오픈 가입 액션 (admin-signup.ts 재작성)
Modify `website/src/lib/actions/admin-signup.ts` — `claimAdminAccount(_prev, formData)`:
- 게이트(명부 사전등록 검사) 제거. 오픈 가입.
- 이메일/비번(≥8) 검증, service client null-guard.
- **중복 검사**: admin_members에 email 이미 있으면 "이미 가입된 이메일입니다." (`.eq("email", email).maybeSingle()`)
- `service.auth.admin.createUser({ email, password, email_confirm: true })`.
- 성공 시 `admin_members` INSERT `{ email, role: 'pending', active: true, user_id: created.user.id, created_by: 'self-signup' }`.
- INSERT 실패 시 생성한 auth user 삭제(고아 정리). `.or()` 금지, email lowercase.
검증: tsc+eslint. 커밋: "가입 액션을 오픈 가입으로 전환: role=pending 대기 계정 생성".

## Task C: 앱에서 pending을 무권한 처리 (auth.ts + data/admin-members.ts)
- `auth.ts`: `loadAdminContext`는 이미 `role in ROLE_RANK` 가드로 pending(=ROLE_RANK 미포함)을 null 처리 → 변경 불필요. 단 확인만.
- `data/admin-members.ts`:
  - `AdminMember.role` 타입을 `AdminRole | "pending"`로 확장(목록에 대기자 표시). `MemberRole` 별칭 도입 가능.
  - `getMyAdminMember()`: 실제 3역할만 반환하도록 `.in("role", ["owner","editor","viewer"])` 추가(pending은 null 반환 → UI에서 비관리자 취급, 사이드바 role 타입 안전).
  - `getAdminMembers()`: 필터 없이 전원(대기 포함) 반환 유지.
검증: tsc. 커밋: "pending 계정 앱 무권한 처리: getMyAdminMember 3역할 한정 + 타입 확장".

## Task D: 명부 액션 + UI 개편
- `admin-members.ts`:
  - `addAdminMemberAction` 제거(직접추가 폼 폐지).
  - `updateAdminRoleAction`: VALID_ROLES에 'pending' 포함(대기로 강등 허용). 마지막 owner 보호 유지.
  - setActive/remove 유지.
- `app/admin/members/MembersManager.tsx`:
  - 상단 "관리자 추가(이메일)" 폼 제거. addAdminMemberAction import 제거.
  - 안내 문구: "가입 링크를 공유하세요. 가입한 사람은 아래에 '대기중'으로 나타나며, 역할을 지정하면 관리자가 됩니다." + 기존 signup URL 복사 박스 유지.
  - 각 행 역할 드롭다운 옵션: 대기(pending)/viewer/editor/owner. role==='pending'이면 "대기중" 배지 표시.
- `app/admin/members/page.tsx`: 변경 없음(getAdminMembers 전원 로드) — 필요시 문구만.
- `app/admin/signup/page.tsx`: 안내 문구를 오픈 가입에 맞게("가입 후 관리자가 역할을 부여하면 사용할 수 있습니다"), "owner가 등록한 이메일로만" 문구 제거.
검증: tsc+eslint+build. 커밋: "명부 UI를 가입우선으로 개편: 직접추가 폼 제거 + 대기자 역할 선정".

## Task E: 통합 검증 + 적용 + 배포
- `npm run build`+`lint`. 최종 리뷰(보안: 오픈가입이 pending만 만들고 권한 0인지, is_active_admin이 pending 배제하는지, 기존 owner 유지).
- CLI로 마이그레이션 적용(`supabase db push`) — 사용자 승인 후. 적용 후 `db query`로 is_active_admin 정의·role CHECK 확인.
- main 머지 + push(사용자 승인).

## Self-Review
- 가입우선 전환 A~D 커버. pending 무권한: SQL(is_active_admin) + 앱(loadAdminContext ROLE_RANK 가드, getMyAdminMember 3역할 한정) 이중.
- 잠김 위험: owner는 3역할에 포함 → is_active_admin 유지. 기존 데이터 role 미변경.
- 오픈가입 남용: pending 권한0로 blast radius 최소, 수용.
