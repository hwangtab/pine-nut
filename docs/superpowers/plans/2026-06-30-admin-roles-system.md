# 관리자 임명·역할 시스템 (Admin Roster & Roles) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "로그인=관리자"였던 pine-nut을 `admin_members` 명부 + owner/editor/viewer 역할 기반으로 바꾸고, owner가 사람을 임명·관리하며, 역할별 권한을 DB RLS + 앱 게이트로 전면 강제한다.

**Architecture:** DB에 `admin_members` 명부와 역할 판정 함수(SECURITY DEFINER)를 두고, 모든 콘텐츠 테이블 RLS를 역할 기반으로 교체한다(쓰기=editor+, 회의록 읽기=active admin). 앱에서는 `getAdminContext()`/`requireEditor()`/`requireOwner()`로 이중 방어한다. 신규 관리자는 owner가 이메일을 명부에 등록한 뒤 본인이 `/admin/signup`에서 비밀번호를 설정(service role로 계정 생성, 이메일 발송 없음). 기존 auth.users 전원을 owner로 부트스트랩해 잠김을 방지한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript(strict), Supabase(@supabase/ssr + service role), Tailwind v4, lucide-react.

## Global Constraints

- 모든 명령은 `website/` 디렉터리에서 실행한다.
- PK는 `BIGINT GENERATED ALWAYS AS IDENTITY` (audit_log 호환).
- 역할: `owner`/`editor`/`viewer`, 위계 `viewer(1) < editor(2) < owner(3)`.
- DB 판정 함수는 **SECURITY DEFINER** 로 정의(admin_members RLS 재귀 회피). `authenticated`에 EXECUTE 부여.
- 서버액션 반환은 `ActionState = { error: string } | null` (`@/lib/actions/state`).
- 인증/역할: 콘텐츠 변경 액션 → editor 이상, 명부 관리 액션 → owner. DB RLS가 최종 방어선.
- 마이그레이션 적용은 **Supabase CLI** (`supabase db push`)로만. 적용 시점은 사용자 승인 후(부트스트랩 → 정책 교체 순서 보장).
- 이메일 발송 시스템 사용 금지. 가입은 명부에 사전 등록된 이메일만 허용(오픈 가입 차단).
- 단위 테스트 인프라 없음 → 검증은 `npm run build` + `npm run lint` + 수동 확인.
- 커밋 메시지 한국어, 끝에 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. 이 기능 파일만 명시적 `git add`(`git add -A` 금지).
- **동시 작업 경고**: Codex가 `src/lib/actions/*`(news/timeline/meetings/page-content 등)를 리팩토링 중일 수 있다. 본 플랜 실행은 Codex 작업이 일단락된 시점에 시작한다. 실행 직전 `git pull`/현재 파일 구조를 재확인할 것.

## 사전 확인 (실행 시작 전 1회)

Codex 리팩토링으로 액션 파일 경로가 바뀌었을 수 있다. 실행 직전 아래로 현재 구조를 확인하고, 본 플랜의 "콘텐츠 변경 함수 목록"과 다르면 컨트롤러에게 보고한다.
```bash
cd website
for d in news timeline meetings page-content; do echo "[$d]"; ls src/lib/actions/$d 2>/dev/null; done
ls src/lib/actions/*.ts | xargs -n1 basename
```

## File Structure

생성:
- `website/supabase/migrations/<ts1>_admin_members.sql` — 명부 테이블 + 판정 함수 + admin_members RLS + 부트스트랩 시드
- `website/supabase/migrations/<ts2>_admin_role_policies.sql` — 콘텐츠 테이블 RLS 역할 기반 교체
- `website/src/lib/data/admin-members.ts` — 명부 타입 + 페처(`getAdminMembers`, `getMyAdminMember`)
- `website/src/lib/actions/admin-members.ts` — owner 전용 명부 CRUD 서버액션 + 마지막 owner 보호
- `website/src/lib/actions/admin-signup.ts` — `claimAdminAccount` (service role)
- `website/src/app/admin/signup/page.tsx` — 가입(claim) 페이지
- `website/src/app/admin/members/page.tsx` — 명부 관리(owner 전용)
- `website/src/app/admin/members/MembersManager.tsx` — 명부 관리 클라이언트 UI

수정:
- `website/src/lib/actions/auth.ts` — `getAdminContext`/`requireEditor`/`requireOwner`/`AdminRole` 추가
- 콘텐츠 변경 함수들(아래 Task 5 목록) — `getAuthenticatedActionClient()` → `requireEditor()` 게이트
- `website/src/app/admin/layout.tsx` — active-admin 게이트(미등록 인증자 차단)
- `website/src/app/layout.tsx` — `isAdmin` 계산을 "editor 이상 활성 관리자"로 변경
- `website/src/components/admin/AdminSidebar.tsx` — "기획단(관리자)" 링크(owner 전용 노출)

---

### Task 1: 명부 테이블 + 판정 함수 + admin_members RLS + 부트스트랩 (마이그레이션 A)

**Files:**
- Create: `website/supabase/migrations/20260630010001_admin_members.sql`

**Interfaces:**
- Produces: 테이블 `admin_members`; 함수 `is_active_admin()`, `admin_role()`, `admin_can_edit()`, `is_admin_owner()`. 이후 모든 태스크가 이 이름/시그니처에 의존.

- [ ] **Step 1: 마이그레이션 작성**

`website/supabase/migrations/20260630010001_admin_members.sql`:

```sql
-- ==================== ADMIN MEMBERS (관리자 명부) ====================
CREATE TABLE IF NOT EXISTS admin_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_members_user_id ON admin_members (user_id);

CREATE TRIGGER admin_members_updated_at
  BEFORE UPDATE ON admin_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== 판정 함수 (SECURITY DEFINER) ====================
-- SECURITY DEFINER로 admin_members를 읽어 RLS 재귀를 회피한다.
CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND (m.user_id = auth.uid()
           OR lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

CREATE OR REPLACE FUNCTION admin_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.role FROM admin_members m
  WHERE m.active
    AND (m.user_id = auth.uid()
         OR lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  ORDER BY CASE m.role WHEN 'owner' THEN 3 WHEN 'editor' THEN 2 ELSE 1 END DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION admin_can_edit()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT admin_role() IN ('owner', 'editor');
$$;

CREATE OR REPLACE FUNCTION is_admin_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT admin_role() = 'owner';
$$;

GRANT EXECUTE ON FUNCTION is_active_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_can_edit() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin_owner() TO authenticated, anon;

-- ==================== admin_members RLS ====================
ALTER TABLE admin_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_members_select" ON admin_members
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "admin_members_owner_insert" ON admin_members
  FOR INSERT TO authenticated WITH CHECK (is_admin_owner());
CREATE POLICY "admin_members_owner_update" ON admin_members
  FOR UPDATE TO authenticated USING (is_admin_owner()) WITH CHECK (is_admin_owner());
CREATE POLICY "admin_members_owner_delete" ON admin_members
  FOR DELETE TO authenticated USING (is_admin_owner());

-- ==================== 부트스트랩: 기존 auth.users 전원을 owner로 ====================
-- 현재 "로그인=전권 관리자"이므로 기존 계정을 owner로 승격해 정책 전환 시 잠김 방지.
INSERT INTO admin_members (user_id, email, role, active, created_by)
SELECT id, email, 'owner', true, 'bootstrap'
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;
```

> 참고: `update_updated_at()` 함수는 기존 마이그레이션(20260311)에 정의돼 있어 재사용한다.

- [ ] **Step 2: 구조 점검**

Run: `cd website && grep -c "SECURITY DEFINER" supabase/migrations/20260630010001_admin_members.sql`
Expected: `4`

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/supabase/migrations/20260630010001_admin_members.sql
git commit -m "관리자 명부 마이그레이션: admin_members + 역할 판정 함수 + 부트스트랩

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 콘텐츠 RLS 역할 기반 교체 (마이그레이션 B)

**Files:**
- Create: `website/supabase/migrations/20260630010002_admin_role_policies.sql`

**Interfaces:**
- Consumes: Task 1 함수.
- Produces: 콘텐츠/회의록/감사로그 테이블의 쓰기 정책이 역할 기반으로 교체됨.

> **위험 주의**: 기존 `USING(true)` 정책을 정확한 이름으로 DROP하지 않으면 권한 구멍이 남는다. 아래 DROP 이름은 기존 마이그레이션(20260311, 20260317, 20260313, 20260630000001)에서 확인된 정책명이다. 적용 후 Step 2의 감사 쿼리로 잔존 `USING(true)` 쓰기 정책이 없는지 반드시 확인한다.

- [ ] **Step 1: 마이그레이션 작성**

`website/supabase/migrations/20260630010002_admin_role_policies.sql`:

```sql
-- news: 공개 읽기 유지, 쓰기는 editor+, 관리자 전체읽기(삭제행 포함)
DROP POLICY IF EXISTS "Admin full access news" ON news;
CREATE POLICY "news_admin_read" ON news
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "news_editor_insert" ON news
  FOR INSERT TO authenticated WITH CHECK (admin_can_edit());
CREATE POLICY "news_editor_update" ON news
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "news_editor_delete" ON news
  FOR DELETE TO authenticated USING (admin_can_edit());

-- timeline_events
DROP POLICY IF EXISTS "Admin full access timeline" ON timeline_events;
CREATE POLICY "timeline_admin_read" ON timeline_events
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "timeline_editor_insert" ON timeline_events
  FOR INSERT TO authenticated WITH CHECK (admin_can_edit());
CREATE POLICY "timeline_editor_update" ON timeline_events
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "timeline_editor_delete" ON timeline_events
  FOR DELETE TO authenticated USING (admin_can_edit());

-- page_content: 공개 읽기 유지, 쓰기 editor+
DROP POLICY IF EXISTS "page_content_auth_insert" ON page_content;
DROP POLICY IF EXISTS "page_content_auth_update" ON page_content;
DROP POLICY IF EXISTS "page_content_auth_delete" ON page_content;
CREATE POLICY "page_content_editor_insert" ON page_content
  FOR INSERT TO authenticated WITH CHECK (admin_can_edit());
CREATE POLICY "page_content_editor_update" ON page_content
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "page_content_editor_delete" ON page_content
  FOR DELETE TO authenticated USING (admin_can_edit());

-- audit_log: 읽기 active admin, 삽입 active admin (기존 authenticated→역할)
DROP POLICY IF EXISTS "Authenticated read audit" ON audit_log;
DROP POLICY IF EXISTS "Authenticated insert audit" ON audit_log;
CREATE POLICY "audit_admin_read" ON audit_log
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "audit_admin_insert" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (is_active_admin());

-- meetings + 하위: 읽기 active admin, 쓰기 editor+
DROP POLICY IF EXISTS "meetings_auth_all" ON meetings;
CREATE POLICY "meetings_admin_read" ON meetings
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meetings_editor_write" ON meetings
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_attendees_auth_all" ON meeting_attendees;
CREATE POLICY "meeting_attendees_admin_read" ON meeting_attendees
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_attendees_editor_write" ON meeting_attendees
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_agendas_auth_all" ON meeting_agendas;
CREATE POLICY "meeting_agendas_admin_read" ON meeting_agendas
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_agendas_editor_write" ON meeting_agendas
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_decisions_auth_all" ON meeting_decisions;
CREATE POLICY "meeting_decisions_admin_read" ON meeting_decisions
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_decisions_editor_write" ON meeting_decisions
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_action_items_auth_all" ON meeting_action_items;
CREATE POLICY "meeting_action_items_admin_read" ON meeting_action_items
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_action_items_editor_write" ON meeting_action_items
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_attachments_auth_all" ON meeting_attachments;
CREATE POLICY "meeting_attachments_admin_read" ON meeting_attachments
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_attachments_editor_write" ON meeting_attachments
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

-- storage: meeting-files 읽기/쓰기를 역할 기반으로 강화
DROP POLICY IF EXISTS "meeting_files_auth_select" ON storage.objects;
DROP POLICY IF EXISTS "meeting_files_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "meeting_files_auth_delete" ON storage.objects;
CREATE POLICY "meeting_files_admin_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'meeting-files' AND is_active_admin());
CREATE POLICY "meeting_files_editor_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'meeting-files' AND admin_can_edit());
CREATE POLICY "meeting_files_editor_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'meeting-files' AND admin_can_edit());

-- images 버킷: 쓰기를 editor+로 (public read 유지)
DROP POLICY IF EXISTS "Authenticated upload images" ON storage.objects;
CREATE POLICY "images_editor_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images' AND admin_can_edit());
```

> signatures 테이블은 `20260622055905_lock_down_signature_data_api`에서 이미 잠금 처리됨. 본 마이그레이션에서 건드리지 않는다(서명 입력 경로 보존). 관리자 읽기가 필요하면 후속에서 `is_active_admin()` 정책을 별도 추가.

- [ ] **Step 2: (적용 시점, Task 9) 정책 감사 쿼리 준비**

적용 후 아래로 잔존 위험 정책을 확인할 SQL을 마이그레이션과 함께 보관(주석으로 파일 하단에 기재):
```sql
-- 적용 후 수동 확인용 (CLI/대시보드):
-- SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies
--   WHERE schemaname IN ('public','storage')
--   AND (qual = 'true' OR with_check = 'true')
--   AND cmd IN ('INSERT','UPDATE','DELETE','ALL');
-- → 결과가 공개 SELECT 외에 쓰기 정책으로 남으면 권한 구멍.
```

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/supabase/migrations/20260630010002_admin_role_policies.sql
git commit -m "콘텐츠/회의록 RLS 역할 기반 교체: 쓰기 editor+, 회의록 읽기 active admin

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 인증·역할 헬퍼 (`auth.ts` 확장)

**Files:**
- Modify: `website/src/lib/actions/auth.ts`

**Interfaces:**
- Consumes: 기존 `getAuthenticatedActionContext`, `createSupabaseServerClient`.
- Produces:
  - `type AdminRole = "owner" | "editor" | "viewer"`
  - `getAdminContext(): Promise<{ supabase; user; role: AdminRole; member: { id: number; email: string; displayName: string | null } }>` — 활성 관리자 아니면 `/admin/login` redirect
  - `requireEditor(): Promise<{ supabase } | { error: string }>`
  - `requireOwner(): Promise<{ supabase; role: AdminRole } | { error: string }>`

- [ ] **Step 1: auth.ts에 역할 헬퍼 추가** (기존 export는 유지, 아래를 파일 끝에 추가)

```ts
export type AdminRole = "owner" | "editor" | "viewer";

const ROLE_RANK: Record<AdminRole, number> = { viewer: 1, editor: 2, owner: 3 };

export interface AdminContext {
  supabase: AuthenticatedActionClient;
  user: User;
  role: AdminRole;
  member: { id: number; email: string; displayName: string | null };
}

async function loadAdminContext(): Promise<AdminContext | null> {
  const { supabase, user } = await getAuthenticatedActionContext();
  const email = (user.email ?? "").toLowerCase();
  const { data } = await supabase
    .from("admin_members")
    .select("id, email, display_name, role, active, user_id")
    .or(`user_id.eq.${user.id},email.eq.${email}`)
    .eq("active", true)
    .order("role", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    supabase,
    user,
    role: data.role as AdminRole,
    member: { id: data.id, email: data.email, displayName: data.display_name ?? null },
  };
}

// 페이지/레이아웃용: 활성 관리자가 아니면 로그인으로 redirect
export async function getAdminContext(): Promise<AdminContext> {
  const ctx = await loadAdminContext();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

// 콘텐츠 변경 액션용: editor 이상 아니면 친화적 에러 반환(redirect 아님)
export async function requireEditor(): Promise<{ supabase: AuthenticatedActionClient } | { error: string }> {
  const ctx = await loadAdminContext();
  if (!ctx) return { error: "관리자 권한이 없습니다. 다시 로그인해주세요." };
  if (ROLE_RANK[ctx.role] < ROLE_RANK.editor) return { error: "편집 권한이 없습니다. (읽기 전용 계정)" };
  return { supabase: ctx.supabase };
}

// 명부 관리 액션용: owner 아니면 에러
export async function requireOwner(): Promise<{ supabase: AuthenticatedActionClient; role: AdminRole } | { error: string }> {
  const ctx = await loadAdminContext();
  if (!ctx) return { error: "관리자 권한이 없습니다. 다시 로그인해주세요." };
  if (ctx.role !== "owner") return { error: "이 작업은 owner만 할 수 있습니다." };
  return { supabase: ctx.supabase, role: ctx.role };
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/lib/actions/auth.ts`
Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/actions/auth.ts
git commit -m "인증 역할 헬퍼 추가: getAdminContext/requireEditor/requireOwner

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 명부 데이터 페처 (`src/lib/data/admin-members.ts`)

**Files:**
- Create: `website/src/lib/data/admin-members.ts`

**Interfaces:**
- Produces: `AdminMember` 타입, `getAdminMembers(): Promise<AdminMember[]>`, `getMyAdminMember(): Promise<{ role: AdminRole } | null>`.

- [ ] **Step 1: 파일 작성**

```ts
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AdminRole } from "@/lib/actions/auth";

export interface AdminMember {
  id: number;
  email: string;
  displayName: string | null;
  role: AdminRole;
  active: boolean;
  claimed: boolean; // user_id 존재 여부
  createdAt: string;
}

interface AdminMemberRow {
  id: number; email: string; display_name: string | null;
  role: AdminRole; active: boolean; user_id: string | null; created_at: string;
}

function rowToMember(r: AdminMemberRow): AdminMember {
  return {
    id: r.id, email: r.email, displayName: r.display_name, role: r.role,
    active: r.active, claimed: r.user_id !== null, createdAt: r.created_at,
  };
}

export async function getAdminMembers(): Promise<AdminMember[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_members")
    .select("id, email, display_name, role, active, user_id, created_at")
    .order("role", { ascending: false })
    .order("created_at", { ascending: true });
  if (error || !data) {
    console.error("Failed to fetch admin members:", error);
    return [];
  }
  return (data as AdminMemberRow[]).map(rowToMember);
}

export async function getMyAdminMember(): Promise<{ role: AdminRole } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = (user.email ?? "").toLowerCase();
  const { data } = await supabase
    .from("admin_members")
    .select("role, active")
    .or(`user_id.eq.${user.id},email.eq.${email}`)
    .eq("active", true)
    .order("role", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { role: data.role as AdminRole };
}
```

- [ ] **Step 2: 타입체크**

Run: `cd website && npx tsc --noEmit`
Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/data/admin-members.ts
git commit -m "명부 데이터 페처 추가: getAdminMembers/getMyAdminMember

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 콘텐츠 변경 액션에 editor 게이트 적용

**Files (콘텐츠 변경 함수 — 실행 직전 "사전 확인"으로 경로 재검증):**
- Modify: `website/src/lib/actions/news/mutations.ts`
- Modify: `website/src/lib/actions/timeline/mutations.ts`
- Modify: `website/src/lib/actions/meetings/mutations.ts`
- Modify: `website/src/lib/actions/page-content.ts`
- Modify: `website/src/lib/actions/media-library.ts`
- Modify: `website/src/lib/actions/meeting-attachments.ts`

**Interfaces:**
- Consumes: `requireEditor` (Task 3).
- Produces: 모든 콘텐츠 변경(create/update/delete/restore/upload 등)이 editor 미만이면 `{ error }` 반환.

**적용 패턴 (모든 변경 함수에 동일 적용):** 각 함수에서 현재
```ts
const supabase = await getAuthenticatedActionClient();
```
로 클라이언트를 얻는 첫 줄을, 다음으로 교체한다:
```ts
const gate = await requireEditor();
if ("error" in gate) return { error: gate.error };
const supabase = gate.supabase;
```
그리고 파일 상단 import에 `requireEditor`를 추가한다(기존 `getAuthenticatedActionClient` import는 다른 사용처가 없으면 제거).

> try/catch로 감싼 delete/restore의 경우, `requireEditor()` 호출은 try 블록 **안** 첫 줄에 두어 `{ error }` 반환이 catch로 새지 않게 한다.

- [ ] **Step 1: news/mutations.ts 게이트 적용**

`createNews`, `updateNews`, `deleteNews`, (있으면 `restoreNews`, `restoreNewsVersion`) 각각에서 위 패턴으로 교체. import에 `requireEditor` 추가.

- [ ] **Step 2: timeline/mutations.ts 게이트 적용**

`createTimeline`, `updateTimeline`, `deleteTimeline`, `restoreTimeline`, `restoreTimelineVersion`(존재하는 변경 함수 전부)에 동일 패턴.

- [ ] **Step 3: meetings/mutations.ts 게이트 적용**

`createMeeting`, `updateMeeting`, `deleteMeeting`, `restoreMeeting`에 동일 패턴.

- [ ] **Step 4: page-content.ts 게이트 적용**

`page_content`를 변경(upsert/update/delete)하는 모든 export 서버액션에 동일 패턴.

- [ ] **Step 5: media-library.ts 게이트 적용**

업로드/삭제 등 storage/미디어 변경 액션에 동일 패턴.

- [ ] **Step 6: meeting-attachments.ts 게이트 적용**

`uploadMeetingAttachmentAction`, `deleteMeetingAttachmentAction`의 `getAuthenticatedActionClient()` 호출을 `requireEditor()` 패턴으로 교체(각 함수의 인증 획득 지점). `getMeetingAttachmentUrl`은 읽기이므로 `requireEditor` 대신 기존 인증(active admin)이면 충분 — `getAuthenticatedActionClient()` 유지하되, 비관리자 차단은 RLS가 담당.

- [ ] **Step 7: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/lib/actions`
Expected: 오류 없음

- [ ] **Step 8: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/actions/news/mutations.ts website/src/lib/actions/timeline/mutations.ts website/src/lib/actions/meetings/mutations.ts website/src/lib/actions/page-content.ts website/src/lib/actions/media-library.ts website/src/lib/actions/meeting-attachments.ts
git commit -m "콘텐츠 변경 액션에 editor 권한 게이트 적용

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: 명부 관리 서버액션 (owner 전용 + 마지막 owner 보호)

**Files:**
- Create: `website/src/lib/actions/admin-members.ts`

**Interfaces:**
- Consumes: `requireOwner` (Task 3), `logAudit`, `ActionState`, `revalidatePath`.
- Produces:
  - `addAdminMemberAction(_prev, formData)` — fields `email`,`role`,`display_name`
  - `updateAdminRoleAction(id, role)`
  - `setAdminActiveAction(id, active)`
  - `removeAdminMemberAction(id)`

- [ ] **Step 1: 파일 작성**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";
import type { AdminRole } from "./auth";

const VALID_ROLES: AdminRole[] = ["owner", "editor", "viewer"];

function revalidateMembers() {
  revalidatePath("/admin/members");
}

// 마지막 활성 owner를 강등/비활성/삭제하려는지 검사
async function wouldRemoveLastOwner(
  supabase: Awaited<ReturnType<typeof requireOwner>> extends { supabase: infer S } ? S : never,
  targetId: number,
): Promise<boolean> {
  const { data } = await supabase
    .from("admin_members")
    .select("id")
    .eq("role", "owner")
    .eq("active", true);
  const owners: { id: number }[] = data ?? [];
  return owners.length <= 1 && owners.some((o) => o.id === targetId);
}

export async function addAdminMemberAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;

  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const role = (formData.get("role") as string | null)?.trim() ?? "";
  const displayName = (formData.get("display_name") as string | null)?.trim() || null;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "올바른 이메일을 입력해주세요." };
  if (!VALID_ROLES.includes(role as AdminRole)) return { error: "역할 값이 올바르지 않습니다." };

  const { data, error } = await supabase
    .from("admin_members")
    .insert({ email, role, display_name: displayName, active: true, created_by: gate.role })
    .select("id")
    .single();
  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") return { error: "이미 등록된 이메일입니다." };
    return { error: "관리자 추가에 실패했습니다." };
  }
  await logAudit(supabase, "admin_members", data.id, "create", { entityKey: email, payload: { after: { email, role } } });
  revalidateMembers();
  return null;
}

export async function updateAdminRoleAction(id: number, role: string): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  if (!VALID_ROLES.includes(role as AdminRole)) return { error: "역할 값이 올바르지 않습니다." };
  if (role !== "owner" && (await wouldRemoveLastOwner(supabase, id))) {
    return { error: "마지막 owner는 강등할 수 없습니다." };
  }
  const { error } = await supabase.from("admin_members").update({ role }).eq("id", id);
  if (error) return { error: "역할 변경에 실패했습니다." };
  await logAudit(supabase, "admin_members", id, "update", { payload: { role } });
  revalidateMembers();
  return null;
}

export async function setAdminActiveAction(id: number, active: boolean): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  if (!active && (await wouldRemoveLastOwner(supabase, id))) {
    return { error: "마지막 owner는 비활성화할 수 없습니다." };
  }
  const { error } = await supabase.from("admin_members").update({ active }).eq("id", id);
  if (error) return { error: "상태 변경에 실패했습니다." };
  await logAudit(supabase, "admin_members", id, "update", { payload: { active } });
  revalidateMembers();
  return null;
}

export async function removeAdminMemberAction(id: number): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  if (await wouldRemoveLastOwner(supabase, id)) {
    return { error: "마지막 owner는 삭제할 수 없습니다." };
  }
  const { error } = await supabase.from("admin_members").delete().eq("id", id);
  if (error) return { error: "삭제에 실패했습니다." };
  await logAudit(supabase, "admin_members", id, "delete", {});
  revalidateMembers();
  return null;
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/lib/actions/admin-members.ts`
Expected: 오류 없음. (만약 `wouldRemoveLastOwner`의 제네릭 타입 추론이 복잡하면, 인자 타입을 `SupabaseClient`(`@supabase/supabase-js`)로 단순화하고 import 추가.)

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/actions/admin-members.ts
git commit -m "명부 관리 서버액션: 추가/역할변경/활성토글/삭제 + 마지막 owner 보호

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: 가입(claim) 액션 + `/admin/signup` 페이지

**Files:**
- Create: `website/src/lib/actions/admin-signup.ts`
- Create: `website/src/app/admin/signup/page.tsx`

**Interfaces:**
- Consumes: `createSupabaseServiceClient` (`@/lib/supabase-service`), `createSupabaseServerClient`, `ActionState`.
- Produces: `claimAdminAccount(_prev, formData)` — fields `email`,`password`.

- [ ] **Step 1: claim 액션 작성**

`website/src/lib/actions/admin-signup.ts`:

```ts
"use server";

import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ActionState } from "./state";

export async function claimAdminAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "올바른 이메일을 입력해주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };

  const service = createSupabaseServiceClient();
  if (!service) return { error: "서버 설정 오류입니다. 관리자에게 문의해주세요." };

  // 1) 명부 검증: active + 미가입(user_id NULL)
  const { data: member } = await service
    .from("admin_members")
    .select("id, active, user_id")
    .eq("email", email)
    .maybeSingle();
  if (!member || !member.active) return { error: "등록되지 않은 이메일입니다. owner에게 명부 등록을 요청하세요." };
  if (member.user_id) return { error: "이미 가입된 계정입니다. 로그인해주세요." };

  // 2) Auth 계정 생성 (이메일 확인 생략)
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    if ((createErr?.message ?? "").toLowerCase().includes("already")) {
      return { error: "이미 가입된 이메일입니다. 로그인해주세요." };
    }
    return { error: "계정 생성에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 3) 명부에 user_id 연결
  const { error: linkErr } = await service
    .from("admin_members")
    .update({ user_id: created.user.id })
    .eq("id", member.id);
  if (linkErr) {
    // 연결 실패 시 생성한 계정 정리(고아 방지)
    await service.auth.admin.deleteUser(created.user.id);
    return { error: "가입 연결에 실패했습니다. 다시 시도해주세요." };
  }

  return null;
}
```

> 참고: `createSupabaseServerClient`는 import만 두고 사용하지 않으면 lint 오류가 난다. 위 코드는 service 클라이언트만 쓰므로 **`createSupabaseServerClient` import는 넣지 않는다**(이 줄 무시). 실제 작성 시 service import만 둘 것.

- [ ] **Step 2: signup 페이지 작성**

`website/src/app/admin/signup/page.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { claimAdminAccount } from "@/lib/actions/admin-signup";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="w-full px-6 py-4 text-lg font-bold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-xl transition-colors disabled:opacity-50">
      {pending ? "가입 중..." : "가입하기"}
    </button>
  );
}

export default function AdminSignupPage() {
  const [state, formAction] = useActionState(claimAdminAccount, null);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-admin-bg)]">
      <div className="w-full max-w-md bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-8">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">관리자 가입</h1>
        <p className="text-sm text-[var(--color-admin-muted)] mb-6">owner가 등록한 이메일로만 가입할 수 있습니다.</p>
        {state?.error && (
          <div className="mb-4 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] px-4 py-3 rounded-xl text-base">{state.error}</div>
        )}
        {state === null && (
          <div className="mb-4 hidden" aria-hidden />
        )}
        <form action={formAction} className="space-y-4">
          <input name="email" type="email" required placeholder="등록된 이메일"
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40" />
          <input name="password" type="password" required minLength={8} placeholder="비밀번호 (8자 이상)"
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40" />
          <SubmitButton />
        </form>
        <p className="mt-6 text-sm text-[var(--color-admin-muted)]">
          가입 후 <Link href="/admin/login" className="text-[var(--color-forest)] underline">로그인</Link>하세요.
        </p>
      </div>
    </div>
  );
}
```

> 가입 성공(state===null) 시 성공 안내가 필요하면, 별도 성공 상태를 도입하기보다 사용자가 로그인 링크로 이동하게 둔다(YAGNI). 위 `state === null` hidden 블록은 제거해도 됨 — 실제 작성 시 불필요하면 넣지 않는다.

- [ ] **Step 3: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/lib/actions/admin-signup.ts src/app/admin/signup/page.tsx`
Expected: 오류 없음

- [ ] **Step 4: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/actions/admin-signup.ts website/src/app/admin/signup/page.tsx
git commit -m "관리자 가입(claim) 흐름: 명부 검증 후 service role 계정 생성 + signup 페이지

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> **주의**: `/admin/signup`은 미들웨어(`proxy.ts`)에서 비로그인 접근이 차단될 수 있다. Task 9에서 proxy의 `/admin/:path*` 매처가 `/admin/signup`도 막는지 확인하고, 막으면 `/admin/login`과 함께 예외 처리(비로그인 허용)한다.

---

### Task 8: 명부 관리 UI (`/admin/members`, owner 전용)

**Files:**
- Create: `website/src/app/admin/members/page.tsx`
- Create: `website/src/app/admin/members/MembersManager.tsx`

**Interfaces:**
- Consumes: `getAdminContext` (Task 3), `getAdminMembers` (Task 4), Task 6 액션.

- [ ] **Step 1: 서버 페이지 작성** (owner 게이트 + 데이터 로드)

`website/src/app/admin/members/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/actions/auth";
import { getAdminMembers } from "@/lib/data/admin-members";
import MembersManager from "./MembersManager";

export default async function AdminMembersPage() {
  const ctx = await getAdminContext();
  if (ctx.role !== "owner") redirect("/admin");
  const members = await getAdminMembers();
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-6">기획단(관리자) 관리</h1>
      <MembersManager members={members} />
    </div>
  );
}
```

- [ ] **Step 2: 클라이언트 매니저 작성**

`website/src/app/admin/members/MembersManager.tsx`:

```tsx
"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { AdminMember } from "@/lib/data/admin-members";
import {
  addAdminMemberAction,
  updateAdminRoleAction,
  setAdminActiveAction,
  removeAdminMemberAction,
} from "@/lib/actions/admin-members";

const inputCls = "px-4 py-3 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="px-6 py-3 bg-[var(--color-forest)] text-white font-bold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors disabled:opacity-50">
      {pending ? "추가 중..." : "추가"}
    </button>
  );
}

export default function MembersManager({ members }: { members: AdminMember[] }) {
  const [state, formAction] = useActionState(addAdminMemberAction, null);
  const [pending, startTransition] = useTransition();

  function changeRole(id: number, role: string) {
    startTransition(() => { updateAdminRoleAction(id, role); });
  }
  function toggleActive(id: number, active: boolean) {
    startTransition(() => { setAdminActiveAction(id, active); });
  }
  function remove(id: number) {
    if (!confirm("이 관리자를 명부에서 삭제할까요?")) return;
    startTransition(() => { removeAdminMemberAction(id); });
  }

  return (
    <div className="space-y-8">
      <form action={formAction} className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-5 space-y-3">
        <h2 className="font-bold text-[var(--color-admin-text)]">관리자 추가</h2>
        {state?.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
        <div className="flex flex-col sm:flex-row gap-2">
          <input name="email" type="email" required placeholder="이메일" className={`${inputCls} flex-1`} />
          <input name="display_name" placeholder="이름(선택)" className={`${inputCls} sm:w-40`} />
          <select name="role" defaultValue="editor" className={`${inputCls} bg-[var(--color-admin-surface)]`}>
            <option value="owner">owner</option>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
          </select>
          <AddButton />
        </div>
        <p className="text-sm text-[var(--color-admin-muted)]">추가 후 본인이 /admin/signup에서 비밀번호를 설정해 가입합니다.</p>
      </form>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[var(--color-admin-text)] truncate">{m.displayName ? `${m.displayName} · ` : ""}{m.email}</p>
              <p className="text-sm text-[var(--color-admin-muted)]">
                {m.claimed ? "가입됨" : "미가입"} {m.active ? "" : "· 비활성"}
              </p>
            </div>
            <select value={m.role} disabled={pending} onChange={(e) => changeRole(m.id, e.target.value)}
              className={`${inputCls} bg-[var(--color-admin-surface)] sm:w-32`}>
              <option value="owner">owner</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
            <button onClick={() => toggleActive(m.id, !m.active)} disabled={pending}
              className="px-3 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-admin-border)] transition-colors">
              {m.active ? "비활성화" : "활성화"}
            </button>
            <button onClick={() => remove(m.id)} disabled={pending}
              className="px-3 py-2 text-sm font-semibold text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg hover:opacity-80 transition-colors">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/app/admin/members`
Expected: 오류 없음

- [ ] **Step 4: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/app/admin/members
git commit -m "명부 관리 UI 추가: /admin/members (owner 전용)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: UI 권한 연동 (레이아웃 게이트 · isAdmin · 사이드바 · proxy) + 빌드/검증

**Files:**
- Modify: `website/src/app/admin/layout.tsx`
- Modify: `website/src/app/layout.tsx`
- Modify: `website/src/components/admin/AdminSidebar.tsx`
- Modify: `website/src/proxy.ts` (필요 시)

**Interfaces:**
- Consumes: `getMyAdminMember` (Task 4), `getAdminContext` (Task 3).

- [ ] **Step 1: admin 레이아웃에 active-admin 게이트 추가**

`website/src/app/admin/layout.tsx`를 server component로 두고, 로그인/가입 외 경로에서 활성 관리자가 아니면 차단. 단 `/admin/login`, `/admin/signup`은 예외. 레이아웃은 경로를 직접 알 수 없으므로, 게이트는 각 보호 페이지가 `getAdminContext()`를 호출하는 방식(이미 members 페이지가 사용)으로 충분하다. **레이아웃 변경은 최소화**: 기존 레이아웃 유지. (active-admin 차단은 RLS + 페이지별 getAdminContext + Task 5 게이트로 달성.)
→ 이 Step은 "레이아웃은 그대로 두고, 보호가 필요한 페이지에서 getAdminContext를 호출한다"는 결정을 확인하는 것으로 갈음한다. 코드 변경 없음.

- [ ] **Step 2: 루트 layout.tsx의 isAdmin을 editor+로 변경**

`website/src/app/layout.tsx`의 `isAdmin` 계산(현재 `getUser() != null`)을 editor 이상 활성 관리자로 교체. 현재 코드(36–41행 부근)의 함수를 다음으로 바꾼다:

```ts
import { getMyAdminMember } from "@/lib/data/admin-members";
// ...
async function computeIsAdmin(): Promise<boolean> {
  const me = await getMyAdminMember();
  return me?.role === "owner" || me?.role === "editor";
}
```
그리고 `isAdmin` 산출부에서 이 함수를 사용(`getMyAdminMember`는 내부에서 인증/활성까지 확인).

- [ ] **Step 3: 사이드바에 owner 전용 "기획단" 링크 추가**

`AdminSidebar.tsx`는 client component다. owner 여부를 서버에서 받아 표시해야 하므로, `getMyAdminMember`를 호출하는 server wrapper를 두기보다, 사이드바에 `role` prop을 전달한다. 최소 변경안: admin 레이아웃(server)에서 `getMyAdminMember()`로 role을 구해 `<AdminSidebar role={role} />`로 전달하고, 사이드바에서 `role === "owner"`일 때만 `{ href: "/admin/members", label: "기획단", icon: Users }` 항목을 navItems에 포함.

`admin/layout.tsx` 수정:
```tsx
import { getMyAdminMember } from "@/lib/data/admin-members";
// ...
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getMyAdminMember();
  return (
    <div className="flex min-h-screen bg-[var(--color-admin-bg)]" style={{ fontSize: "18px" }}>
      <AdminSidebar role={me?.role ?? null} />
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
    </div>
  );
}
```

`AdminSidebar.tsx` 수정: props에 `role: "owner"|"editor"|"viewer"|null` 추가, navItems를 함수로 만들어 owner면 기획단 항목 포함:
```tsx
const baseNav = [ /* 기존 항목들 */ ];
const navItems = role === "owner"
  ? [...baseNav, { href: "/admin/members", label: "기획단", icon: Users }]
  : baseNav;
```
(`Users` 아이콘은 이미 import됨.)

- [ ] **Step 4: proxy.ts에서 /admin/signup 비로그인 허용 확인**

`website/src/proxy.ts`에서 비로그인 사용자가 `/admin/login`처럼 `/admin/signup`도 접근 가능하도록 예외에 추가(현재 `isAdminLoginPage` 분기 옆에 `/admin/signup` 허용). 미로그인 리다이렉트 대상에서 signup을 제외한다.

- [ ] **Step 5: 빌드 + 린트**

Run: `cd website && npm run build && npm run lint`
Expected: 성공. `/admin/members`, `/admin/signup` 라우트가 빌드 출력에 포함.

- [ ] **Step 6: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/app/admin/layout.tsx website/src/app/layout.tsx website/src/components/admin/AdminSidebar.tsx website/src/proxy.ts
git commit -m "UI 권한 연동: editor+ 인라인편집 + owner 전용 기획단 링크 + signup 접근 허용

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: 마이그레이션 적용(CLI) + 수동 검증

**Files:** (없음 — 운영 적용·검증)

> **이 태스크는 사용자 승인 시점에만 실행.** Codex 작업이 일단락되고, 위 코드가 main에 머지된 뒤 진행.

- [ ] **Step 1: 적용 전 안전 확인**

Run: `cd website && supabase migration list`
Expected: `20260630010001`, `20260630010002`가 Local에만 있고 Remote엔 없음(다른 미적용 마이그레이션이 끼어있으면 컨트롤러에 보고).

- [ ] **Step 2: CLI로 적용 (부트스트랩 → 정책 순서 보장됨)**

Run: `cd website && supabase db push`
Expected: `20260630010001`(명부+부트스트랩) → `20260630010002`(정책 교체) 순으로 적용.

- [ ] **Step 3: 부트스트랩·정책 감사 (대시보드 SQL Editor 또는 CLI)**

확인 쿼리:
```sql
-- 기존 관리자가 owner로 들어갔는지
SELECT count(*) FROM admin_members WHERE role='owner' AND active;
-- 잔존 위험(쓰기) 정책 없는지
SELECT tablename, policyname, cmd FROM pg_policies
  WHERE schemaname IN ('public','storage')
  AND (qual = 'true' OR with_check = 'true')
  AND cmd IN ('INSERT','UPDATE','DELETE','ALL');
```
Expected: owner ≥ 1; 두 번째 쿼리는 공개 SELECT 외 쓰기 정책이 남지 않아야 함(빈 결과 또는 SELECT만).

- [ ] **Step 4: 수동 UI 검증**

1. 기존 owner 계정으로 로그인 → `/admin/members`에 본인이 owner로 보임, 사이드바 "기획단" 노출.
2. editor 이메일 추가 → 그 이메일로 `/admin/signup` 가입 → 로그인 → 콘텐츠 편집 가능, `/admin/members` 접근 시 `/admin`으로 리다이렉트.
3. viewer 이메일 추가·가입 → 인라인 편집 버튼 미노출, 직접 편집 액션 시도 시 "편집 권한 없음" 또는 RLS 거부.
4. 마지막 owner 강등/비활성/삭제 시도 → 차단 메시지 확인.
5. 명부에 없는 이메일로 `/admin/signup` → "등록되지 않은 이메일" 거부.

- [ ] **Step 5: 결과 보고**

빌드/적용/감사/수동검증 결과를 사용자에게 보고. 문제 시 해당 태스크로 복귀.

---

## Self-Review

**Spec coverage:**
- admin_members 모델 → Task 1 ✓
- 판정 함수 + RLS 전면 교체 → Task 1(함수·admin_members) + Task 2(콘텐츠) ✓
- 앱 게이트(getAdminContext/requireEditor/requireOwner) → Task 3 ✓
- 콘텐츠 editor 강제 → Task 5 ✓
- 명부 관리(owner) + 마지막 owner 보호 → Task 6(액션) + Task 8(UI) ✓
- claim 가입(service role, 명부 검증, 이메일 없음) → Task 7 ✓
- 부트스트랩(auth.users→owner) → Task 1 ✓
- UI 연동(isAdmin=editor+, owner 링크, signup 접근) → Task 9 ✓
- CLI 적용 + 잠김 방지 순서 + 수동 검증 → Task 10 ✓

**Placeholder scan:** 코드 단계에 실제 코드 포함. Task 5는 동일 패턴의 기계적 반복이라 패턴 1회 제시 + 대상 함수 열거(플레이스홀더 아님). Task 9 Step 1은 "코드 변경 없음" 결정으로 명시.

**Type consistency:** `AdminRole`(Task 3) → Task 4·6·8에서 동일 사용. `requireEditor`/`requireOwner` 반환 `{supabase}|{error}` → Task 5·6 소비 일치. `getMyAdminMember`(Task 4) → Task 9 소비. `AdminMember`(Task 4) → Task 8 소비.

**알려진 위험:**
- Task 2의 정책 DROP 이름이 실제 원격과 다르면 권한 구멍 → Task 10 Step 3 감사 쿼리로 필수 확인.
- Codex 동시 작업으로 Task 5 대상 파일 경로가 바뀔 수 있음 → "사전 확인" 절차로 재검증.
- 부트스트랩 후 owner가 과다할 수 있음(기존 auth.users 수만큼) → 적용 후 owner가 정리.
