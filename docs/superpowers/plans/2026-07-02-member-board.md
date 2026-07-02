# 일반회원 게시판 (Member Board) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 누구나 읽고 로그인 회원(pending 포함)만 쓰는 단일 게시판(글+댓글)을 추가한다. 본인 수정/삭제 + 기획단(editor+) 숨김/삭제, 작성자 닉네임 표시.

**Architecture:** 기존 pine-nut 패턴(App Router + 서버액션 + Supabase RLS + 소프트삭제 + audit_log). 공개 읽기라 `/board`는 공개 서버 컴포넌트, 쓰기/운영은 서버액션 + RLS 이중 방어. 회원 판정 `is_member()`(pending 포함), 모더레이션 `admin_can_edit()`(editor+). 닉네임은 작성 시점 스냅샷(`author_nickname`)으로 공개 표시(admin_members는 공개 SELECT 불가하므로).

**Tech Stack:** Next.js 16 App Router, React 19, TS(strict), Supabase(@supabase/ssr), Tailwind v4, lucide-react.

## Global Constraints
- `website/`에서 실행. 커밋 한국어 + `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. `git add`는 해당 파일만(`-A` 금지; untracked `website/COMPREHENSIVE_CODE_REVIEW.md`·`.claude/` 방치).
- PK `BIGINT GENERATED ALWAYS AS IDENTITY`. 서버액션 반환 `ActionState = {error:string}|null` (`@/lib/actions/state`).
- 회원(pending 포함) 판정: DB `is_member()`, 앱 `requireMember()`(신규, `@/lib/actions/auth`). 모더레이션: DB `admin_can_edit()`, 앱 `requireEditor()`(기존).
- **`admin_members`는 RLS상 활성 관리자만 SELECT** → 공개 닉네임은 `author_nickname` 스냅샷으로만 표시(조인 금지).
- 소프트삭제(`is_deleted`)·블라인드(`is_hidden`), 물리 DELETE 미사용. audit_log 기록.
- 마이그레이션 적용은 CLI(`supabase db push`), 사용자 승인 후. 검증 `npm run build`+`npm run lint`(테스트 인프라 없음).

## File Structure
생성:
- `website/supabase/migrations/20260702010001_member_board.sql` — 2테이블 + is_member() + RLS + 인덱스
- `website/src/lib/data/board.ts` — 타입 + `getBoardPosts`, `getBoardPost`
- `website/src/lib/actions/board.ts` — 글/댓글 CRUD + 모더레이션
- `website/src/lib/actions/member.ts` — `setMyNickname`
- `website/src/app/board/page.tsx` — 목록(공개)
- `website/src/app/board/[id]/page.tsx` — 상세+댓글(공개)
- `website/src/app/board/[id]/BoardPostActions.tsx` — 본인/기획단 글 액션(client)
- `website/src/app/board/[id]/CommentSection.tsx` — 댓글 목록+작성+삭제/모더(client)
- `website/src/app/board/new/page.tsx` — 작성(회원)
- `website/src/app/board/[id]/edit/page.tsx` — 수정(본인)
- `website/src/components/board/BoardPostForm.tsx` — 글 작성/수정 폼(client)
수정:
- `website/src/lib/actions/auth.ts` — `requireMember()` 추가
- `website/src/lib/data/member.ts` (신규 또는 admin-members.ts) — `getMyMemberProfile()`
- `website/src/app/mypage/page.tsx` + `website/src/app/mypage/NicknameForm.tsx`(신규) — 닉네임 설정
- 헤더 기본 nav에 "게시판"(`/board`) 링크 — `website/src/lib/custom-sections.ts`의 `defaultNavLinks()`

---

### Task 1: 마이그레이션 (board_posts + board_comments + is_member + RLS)

**Files:** Create `website/supabase/migrations/20260702010001_member_board.sql`.

**Interfaces:** Produces tables `board_posts`, `board_comments`; function `is_member()`.

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- ==================== is_member(): pending 포함 활성 회원 ====================
CREATE OR REPLACE FUNCTION is_member()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND (m.user_id = auth.uid()
           OR lower(m.email) = lower(auth.jwt() ->> 'email'))
  );
$$;
GRANT EXECUTE ON FUNCTION is_member() TO authenticated, anon;

-- ==================== board_posts ====================
CREATE TABLE IF NOT EXISTS board_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_board_posts_created ON board_posts (created_at DESC) WHERE NOT is_deleted;
CREATE TRIGGER board_posts_updated_at BEFORE UPDATE ON board_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== board_comments ====================
CREATE TABLE IF NOT EXISTS board_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_board_comments_post ON board_comments (post_id, created_at);
CREATE TRIGGER board_comments_updated_at BEFORE UPDATE ON board_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== RLS ====================
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_comments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기(삭제·숨김 제외)
CREATE POLICY "board_posts_public_read" ON board_posts
  FOR SELECT TO anon, authenticated USING (NOT is_deleted AND NOT is_hidden);
CREATE POLICY "board_comments_public_read" ON board_comments
  FOR SELECT TO anon, authenticated USING (NOT is_deleted AND NOT is_hidden);
-- 기획단 전체 열람(숨김·삭제 포함)
CREATE POLICY "board_posts_admin_read" ON board_posts
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "board_comments_admin_read" ON board_comments
  FOR SELECT TO authenticated USING (is_active_admin());
-- 회원 작성
CREATE POLICY "board_posts_member_insert" ON board_posts
  FOR INSERT TO authenticated WITH CHECK (is_member() AND author_user_id = auth.uid());
CREATE POLICY "board_comments_member_insert" ON board_comments
  FOR INSERT TO authenticated WITH CHECK (is_member() AND author_user_id = auth.uid());
-- 본인 수정/삭제(소프트)
CREATE POLICY "board_posts_owner_update" ON board_posts
  FOR UPDATE TO authenticated USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "board_comments_owner_update" ON board_comments
  FOR UPDATE TO authenticated USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid());
-- 기획단 모더레이션(숨김/삭제 토글)
CREATE POLICY "board_posts_editor_update" ON board_posts
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "board_comments_editor_update" ON board_comments
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
```

- [ ] **Step 2: 점검** — Run: `cd website && grep -c "CREATE POLICY" supabase/migrations/20260702010001_member_board.sql` → Expected `10`. `grep -c "SECURITY DEFINER" ...` → `1`.

- [ ] **Step 3: Commit**
```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/supabase/migrations/20260702010001_member_board.sql
git commit -m "게시판 마이그레이션: board_posts/comments + is_member() + RLS

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: requireMember + 회원 프로필 페처 + 닉네임 액션 + /mypage 닉네임

**Files:** Modify `src/lib/actions/auth.ts`; Create `src/lib/data/member.ts`, `src/lib/actions/member.ts`, `src/app/mypage/NicknameForm.tsx`; Modify `src/app/mypage/page.tsx`.

**Interfaces:**
- Produces: `requireMember(): Promise<{ supabase; user; memberId: number; nickname: string | null } | { error: string }>`; `getMyMemberProfile(): Promise<{ memberId: number; nickname: string | null; isMember: boolean } | null>`; `setMyNickname(_prev, formData): Promise<ActionState>`.

- [ ] **Step 1: `requireMember()` 추가** — `src/lib/actions/auth.ts` 파일 끝에 추가. (기존 `loadAdminContext`는 pending을 제외하므로 재사용 불가 — pending 포함 별도 조회.)
```ts
// 게시판 작성용: pending 포함 활성 회원이면 통과(로그인 안 됐으면 에러, redirect 아님)
export async function requireMember(): Promise<
  { supabase: AuthenticatedActionClient; user: User; memberId: number; nickname: string | null } | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "서버 설정 오류입니다." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const email = (user.email ?? "").toLowerCase();
  const cols = "id, display_name";
  const seen = new Map<number, { id: number; display_name: string | null }>();
  const { data: byId } = await supabase.from("admin_members").select(cols).eq("user_id", user.id).eq("active", true);
  for (const r of (byId ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  if (email) {
    const { data: byEmail } = await supabase.from("admin_members").select(cols).eq("email", email).eq("active", true);
    for (const r of (byEmail ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  }
  const row = [...seen.values()].sort((a, b) => a.id - b.id)[0];
  if (!row) return { error: "회원만 작성할 수 있습니다." };
  return { supabase, user, memberId: row.id, nickname: row.display_name ?? null };
}
```
(`createSupabaseServerClient`, `User` 는 이미 auth.ts에 import되어 있음 — 확인 후 없으면 추가.)

- [ ] **Step 2: `getMyMemberProfile()` 페처** — Create `src/lib/data/member.ts`:
```ts
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getMyMemberProfile(): Promise<{ memberId: number; nickname: string | null; isMember: boolean } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = (user.email ?? "").toLowerCase();
  const seen = new Map<number, { id: number; display_name: string | null }>();
  const { data: byId } = await supabase.from("admin_members").select("id, display_name").eq("user_id", user.id).eq("active", true);
  for (const r of (byId ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  if (email) {
    const { data: byEmail } = await supabase.from("admin_members").select("id, display_name").eq("email", email).eq("active", true);
    for (const r of (byEmail ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  }
  const row = [...seen.values()].sort((a, b) => a.id - b.id)[0];
  if (!row) return null;
  return { memberId: row.id, nickname: row.display_name ?? null, isMember: true };
}
```

- [ ] **Step 3: `setMyNickname` 액션** — Create `src/lib/actions/member.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "./auth";
import type { ActionState } from "./state";

export async function setMyNickname(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const nickname = (formData.get("nickname") as string | null)?.trim() ?? "";
  if (nickname.length < 2 || nickname.length > 20) return { error: "닉네임은 2~20자로 입력해주세요." };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  const { error } = await gate.supabase.from("admin_members").update({ display_name: nickname }).eq("id", gate.memberId);
  if (error) return { error: "닉네임 저장에 실패했습니다." };
  revalidatePath("/mypage");
  return null;
}
```

- [ ] **Step 4: /mypage 닉네임 폼** — Create `src/app/mypage/NicknameForm.tsx` (client, useActionState(setMyNickname)):
```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setMyNickname } from "@/lib/actions/member";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-lg disabled:opacity-50">{pending ? "저장 중..." : "저장"}</button>;
}

export default function NicknameForm({ current }: { current: string | null }) {
  const [state, formAction] = useActionState(setMyNickname, null);
  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input name="nickname" defaultValue={current ?? ""} placeholder="닉네임(2~20자)" className="px-3 py-2 text-base border border-[var(--color-admin-border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40" />
      <SaveButton />
      {state?.error && <span className="text-sm text-[var(--color-danger)]">{state.error}</span>}
    </form>
  );
}
```
Then in `src/app/mypage/page.tsx`: import `getMyMemberProfile` + `NicknameForm`; fetch profile; render a "닉네임" section with `<NicknameForm current={profile?.nickname ?? null} />` and helper text "게시판 글쓰기 전에 닉네임을 설정하세요." (Keep existing mypage content; add this block.)

- [ ] **Step 5: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/actions/auth.ts src/lib/actions/member.ts src/lib/data/member.ts src/app/mypage` → no errors.
- [ ] **Step 6: Commit**
```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/actions/auth.ts website/src/lib/actions/member.ts website/src/lib/data/member.ts website/src/app/mypage/NicknameForm.tsx website/src/app/mypage/page.tsx
git commit -m "회원 닉네임: requireMember + getMyMemberProfile + setMyNickname + 마이페이지 설정

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 게시판 데이터 페처 (`src/lib/data/board.ts`)

**Files:** Create `src/lib/data/board.ts`.
**Interfaces:** Produces `BoardPostListItem`, `BoardPostDetail`, `BoardComment` types; `getBoardPosts(page)`, `getBoardPost(id)`. 공개 SELECT는 RLS가 삭제·숨김을 걸러줌(anon/user 컨텍스트).

- [ ] **Step 1: 파일 작성**
```ts
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface BoardPostListItem {
  id: number; title: string; authorNickname: string; createdAt: string; commentCount: number;
  isHidden: boolean; isDeleted: boolean;
}
export interface BoardComment {
  id: number; authorUserId: string; authorNickname: string; content: string; createdAt: string;
  isHidden: boolean; isDeleted: boolean;
}
export interface BoardPostDetail {
  id: number; authorUserId: string; authorNickname: string; title: string; content: string;
  createdAt: string; updatedAt: string; isHidden: boolean; isDeleted: boolean; comments: BoardComment[];
}

interface PostRow {
  id: number; author_user_id: string; author_nickname: string; title: string; content: string;
  created_at: string; updated_at: string; is_hidden: boolean; is_deleted: boolean;
  board_comments?: { count: number }[];
}
interface CommentRow {
  id: number; author_user_id: string; author_nickname: string; content: string; created_at: string;
  is_hidden: boolean; is_deleted: boolean;
}

export async function getBoardPosts(page = 1, perPage = 20): Promise<{ items: BoardPostListItem[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { items: [], total: 0 };
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, error, count } = await supabase
    .from("board_posts")
    .select("id, title, author_nickname, created_at, is_hidden, is_deleted, board_comments(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error || !data) { console.error("getBoardPosts", error); return { items: [], total: 0 }; }
  return {
    items: (data as PostRow[]).map((r) => ({
      id: r.id, title: r.title, authorNickname: r.author_nickname, createdAt: r.created_at,
      commentCount: r.board_comments?.[0]?.count ?? 0, isHidden: r.is_hidden, isDeleted: r.is_deleted,
    })),
    total: count ?? 0,
  };
}

export async function getBoardPost(id: number): Promise<BoardPostDetail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, author_user_id, author_nickname, title, content, created_at, updated_at, is_hidden, is_deleted, board_comments(id, author_user_id, author_nickname, content, created_at, is_hidden, is_deleted)")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("getBoardPost", error); return null; }
  if (!data) return null;
  const p = data as PostRow & { board_comments: CommentRow[] };
  return {
    id: p.id, authorUserId: p.author_user_id, authorNickname: p.author_nickname, title: p.title, content: p.content,
    createdAt: p.created_at, updatedAt: p.updated_at, isHidden: p.is_hidden, isDeleted: p.is_deleted,
    comments: (p.board_comments ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => ({ id: c.id, authorUserId: c.author_user_id, authorNickname: c.author_nickname, content: c.content, createdAt: c.created_at, isHidden: c.is_hidden, isDeleted: c.is_deleted })),
  };
}
```
> 주: 공개 사용자는 RLS로 삭제·숨김 글/댓글이 조회에서 제외됨. 기획단은 `board_*_admin_read` 정책으로 전체가 보이며, UI에서 숨김/삭제 배지로 구분(Task 6·7).

- [ ] **Step 2: Verify** — `cd website && npx tsc --noEmit` → no errors.
- [ ] **Step 3: Commit** — stage `website/src/lib/data/board.ts`; msg "게시판 데이터 페처 추가: getBoardPosts/getBoardPost + 타입".

---

### Task 4: 게시글 서버액션 (`src/lib/actions/board.ts`)

**Files:** Create `src/lib/actions/board.ts`.
**Interfaces:** Consumes `requireMember`, `requireEditor` (`./auth`), `logAudit` (`./audit`), `ActionState`, `revalidatePath`, `redirect`. Produces: `createBoardPost(_prev, formData)`(redirect), `updateBoardPost(id,_prev,formData)`(redirect), `deleteBoardPost(id)`, `setPostHidden(id, hidden)`.

- [ ] **Step 1: 파일 작성**
```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember, requireEditor } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";

function parseTitleContent(formData: FormData): { title: string; content: string } | { error: string } {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  if (!title || title.length > 200) return { error: "제목을 1~200자로 입력해주세요." };
  if (!content) return { error: "내용을 입력해주세요." };
  return { title, content };
}

export async function createBoardPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseTitleContent(formData);
  if ("error" in parsed) return { error: parsed.error };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  if (!gate.nickname) return { error: "닉네임을 먼저 설정해주세요. (마이페이지)" };
  const { data, error } = await gate.supabase
    .from("board_posts")
    .insert({ author_user_id: gate.user.id, author_nickname: gate.nickname, title: parsed.title, content: parsed.content })
    .select("id").single();
  if (error || !data) return { error: "글 작성에 실패했습니다." };
  await logAudit(gate.supabase, "board_posts", data.id, "create", { entityKey: parsed.title });
  revalidatePath("/board");
  redirect(`/board/${data.id}`);
}

export async function updateBoardPost(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseTitleContent(formData);
  if ("error" in parsed) return { error: parsed.error };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  // 본인 글만: RLS(owner_update)로 강제되며, 앱에서도 author 확인
  const { data, error } = await gate.supabase
    .from("board_posts").update({ title: parsed.title, content: parsed.content })
    .eq("id", id).eq("author_user_id", gate.user.id).select("id").single();
  if (error || !data) return { error: "수정에 실패했습니다. (본인 글만 수정 가능)" };
  await logAudit(gate.supabase, "board_posts", id, "update", { entityKey: parsed.title });
  revalidatePath("/board"); revalidatePath(`/board/${id}`);
  redirect(`/board/${id}`);
}

export async function deleteBoardPost(id: number): Promise<ActionState> {
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  const { error } = await gate.supabase
    .from("board_posts").update({ is_deleted: true }).eq("id", id).eq("author_user_id", gate.user.id).select("id").single();
  if (error) return { error: "삭제에 실패했습니다. (본인 글만)" };
  await logAudit(gate.supabase, "board_posts", id, "delete", {});
  revalidatePath("/board"); revalidatePath(`/board/${id}`);
  return null;
}

// 기획단 모더레이션: 숨김 토글(및 숨김 해제)
export async function setPostHidden(id: number, hidden: boolean): Promise<ActionState> {
  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const { error } = await gate.supabase.from("board_posts").update({ is_hidden: hidden }).eq("id", id).select("id").single();
  if (error) return { error: "처리에 실패했습니다." };
  await logAudit(gate.supabase, "board_posts", id, "update", { payload: { is_hidden: hidden } });
  revalidatePath("/board"); revalidatePath(`/board/${id}`);
  return null;
}
```
> 기획단이 타인 글을 완전 삭제해야 하면 `setPostHidden`으로 블라인드 처리(v1). 필요 시 `moderateDeletePost`(admin_can_edit로 is_deleted=true) 추가는 후속.

- [ ] **Step 2: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/actions/board.ts` → no errors.
- [ ] **Step 3: Commit** — stage `website/src/lib/actions/board.ts`; msg "게시글 서버액션: 작성/수정/삭제 + 기획단 숨김".

---

### Task 5: 댓글 서버액션 (board.ts에 추가)

**Files:** Modify `src/lib/actions/board.ts`.
**Interfaces:** Produces `createBoardComment(postId, _prev, formData)`, `deleteBoardComment(id, postId)`, `setCommentHidden(id, postId, hidden)`.

- [ ] **Step 1: 아래 함수들을 `board.ts` 끝에 추가**
```ts
export async function createBoardComment(postId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  if (!content) return { error: "댓글 내용을 입력해주세요." };
  if (content.length > 2000) return { error: "댓글은 2000자 이하로 입력해주세요." };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  if (!gate.nickname) return { error: "닉네임을 먼저 설정해주세요. (마이페이지)" };
  const { data, error } = await gate.supabase
    .from("board_comments")
    .insert({ post_id: postId, author_user_id: gate.user.id, author_nickname: gate.nickname, content })
    .select("id").single();
  if (error || !data) return { error: "댓글 작성에 실패했습니다." };
  await logAudit(gate.supabase, "board_comments", data.id, "create", {});
  revalidatePath(`/board/${postId}`);
  return null;
}

export async function deleteBoardComment(id: number, postId: number): Promise<ActionState> {
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  const { error } = await gate.supabase
    .from("board_comments").update({ is_deleted: true }).eq("id", id).eq("author_user_id", gate.user.id).select("id").single();
  if (error) return { error: "삭제에 실패했습니다. (본인 댓글만)" };
  await logAudit(gate.supabase, "board_comments", id, "delete", {});
  revalidatePath(`/board/${postId}`);
  return null;
}

export async function setCommentHidden(id: number, postId: number, hidden: boolean): Promise<ActionState> {
  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const { error } = await gate.supabase.from("board_comments").update({ is_hidden: hidden }).eq("id", id).select("id").single();
  if (error) return { error: "처리에 실패했습니다." };
  await logAudit(gate.supabase, "board_comments", id, "update", { payload: { is_hidden: hidden } });
  revalidatePath(`/board/${postId}`);
  return null;
}
```

- [ ] **Step 2: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/actions/board.ts` → no errors.
- [ ] **Step 3: Commit** — msg "댓글 서버액션: 작성/삭제 + 기획단 숨김".

---

### Task 6: 게시글 폼 + 작성/수정 페이지 + 목록

**Files:** Create `src/components/board/BoardPostForm.tsx`, `src/app/board/new/page.tsx`, `src/app/board/[id]/edit/page.tsx`, `src/app/board/page.tsx`.
**Interfaces:** Consumes `createBoardPost`/`updateBoardPost` (Task 4), `getBoardPosts`/`getBoardPost` (Task 3), `getMyMemberProfile` (Task 2).

- [ ] **Step 1: BoardPostForm** — Create `src/components/board/BoardPostForm.tsx` (client, `useActionState`, title+content, mirrors TimelineForm idiom, CSS vars). props `{ action: (prev: ActionState, fd: FormData) => Promise<ActionState>; initial?: { title: string; content: string }; submitLabel: string }`. Renders error banner, title input(required), content textarea(required, rows 10), SubmitButton via useFormStatus.

- [ ] **Step 2: 작성 페이지** — Create `src/app/board/new/page.tsx` (server): `const profile = await getMyMemberProfile();` — if `!profile` → render "회원만 글을 쓸 수 있습니다" + `/login` 링크; if `!profile.nickname` → "닉네임을 먼저 설정하세요" + `/mypage` 링크; else render `<BoardPostForm action={createBoardPost} submitLabel="등록" />`. Container `p-6 md:p-10 max-w-3xl mx-auto`, "← 목록" link.

- [ ] **Step 3: 수정 페이지** — Create `src/app/board/[id]/edit/page.tsx` (server): `params: Promise<{id}>`; parse id (notFound on NaN); `getBoardPost(id)` → notFound if null; `getMyMemberProfile()` — if post.authorUserId !== current user → `redirect('/board/'+id)` (only author edits; get user via getMyMemberProfile has no userId — instead fetch user: use `createSupabaseServerClient().auth.getUser()` to compare `user.id === post.authorUserId`, else redirect). Render `<BoardPostForm action={updateBoardPost.bind(null, id)} initial={{title,content}} submitLabel="수정" />`.

- [ ] **Step 4: 목록 페이지** — Create `src/app/board/page.tsx` (server): `searchParams: Promise<{page?}>`; `getBoardPosts(page)`; `getMyMemberProfile()` for "글쓰기" 버튼(로그인 회원이면 노출). Render list rows (제목→`/board/[id]`, 닉네임·날짜·댓글수), pagination, empty state. 기획단(요구 시)엔 숨김/삭제 배지 — but list uses public getBoardPosts (RLS hides them for non-admins; for admins they appear with isHidden/isDeleted flags → show badge). Header "게시판" via nav (Task 8). Container같은 admin 목록 톤이되 공개 페이지 스타일.

- [ ] **Step 5: Verify** — `cd website && npx tsc --noEmit && npx eslint src/components/board src/app/board && npm run build` → no errors; `/board`, `/board/new`, `/board/[id]/edit` present.
- [ ] **Step 6: Commit** — stage the 4 files; msg "게시판 목록/작성/수정 페이지 + 글 폼".

---

### Task 7: 상세 페이지 + 댓글/모더레이션 클라이언트

**Files:** Create `src/app/board/[id]/page.tsx`, `src/app/board/[id]/BoardPostActions.tsx`, `src/app/board/[id]/CommentSection.tsx`.
**Interfaces:** Consumes `getBoardPost` (Task 3); `deleteBoardPost`/`setPostHidden` (Task 4); `createBoardComment`/`deleteBoardComment`/`setCommentHidden` (Task 5); `getMyMemberProfile` (Task 2) + current user id.

- [ ] **Step 1: 상세 페이지** — Create `src/app/board/[id]/page.tsx` (server): parse id/notFound; `const post = await getBoardPost(id); if (!post) notFound();`. Get current user (`createSupabaseServerClient().auth.getUser()`) → `me = user?.id`; `profile = await getMyMemberProfile()`; admin flag via `getMyAdminMember()` (editor+? need editor for moderation — use role). Simpler: pass `isEditorPlus` computed from `getMyAdminMember()` role owner/editor. Render title, author, date, content (whitespace-pre-line). If `post.isHidden||post.isDeleted` show a "숨김/삭제됨(기획단만 표시)" 배지. `<BoardPostActions postId={id} isAuthor={me===post.authorUserId} isEditor={isEditorPlus} isHidden={post.isHidden} />` and `<CommentSection postId={id} comments={post.comments} meUserId={me ?? null} canWrite={!!profile} hasNickname={!!profile?.nickname} isEditor={isEditorPlus} />`. "← 목록" link.

- [ ] **Step 2: BoardPostActions** — Create `.../BoardPostActions.tsx` (client): if `isAuthor`: "수정"(Link `/board/{id}/edit`) + "삭제"(confirm → `deleteBoardPost(id)` via useTransition, on success `router.push('/board')`). if `isEditor`: "숨김"/"숨김 해제" 토글 (`setPostHidden(id, !isHidden)`). Surface errors.

- [ ] **Step 3: CommentSection** — Create `.../CommentSection.tsx` (client): renders comment list (닉네임·날짜·내용; 숨김/삭제된 건 기획단에게만 회색 표시). For each comment: if `meUserId===c.authorUserId` show 삭제(→`deleteBoardComment(c.id, postId)`); if `isEditor` show 숨김 토글(`setCommentHidden`). Comment input form (useActionState(createBoardComment.bind(null, postId))) shown when `canWrite`; if `canWrite && !hasNickname` show "닉네임 설정 후 작성 가능" + `/mypage` link; if `!canWrite` show "댓글은 로그인 회원만" + `/login`. Refresh via router.refresh() after mutations.

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/app/board && npm run build` → no errors; `/board/[id]` present.
- [ ] **Step 5: Commit** — stage the 3 files; msg "게시판 상세 페이지 + 댓글/모더레이션".

---

### Task 8: 헤더에 "게시판" 링크

**Files:** Modify `src/lib/custom-sections.ts` (`defaultNavLinks()`).

- [ ] **Step 1** — Read `defaultNavLinks()` in `src/lib/custom-sections.ts`; add an entry `{ label: "게시판", href: "/board" }` (match the existing BuilderLinkItem shape) in a sensible position. Keep all existing links.
- [ ] **Step 2: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/custom-sections.ts && npm run build` → no errors.
- [ ] **Step 3: Commit** — msg "헤더 기본 네비에 게시판 링크 추가".

---

### Task 9: 통합 검증 + 마이그레이션 적용 + 배포

- [ ] **Step 1** — `cd website && npm run build && npm run lint` → 성공; `/board`,`/board/new`,`/board/[id]`,`/board/[id]/edit` 라우트 존재.
- [ ] **Step 2 (사용자 승인 후)** — `supabase migration list`로 `20260702010001`만 미적용 확인 → `supabase db push`.
- [ ] **Step 3 (적용 후 감사, CLI `supabase db query --linked`)**:
  - `SELECT count(*) FROM pg_policies WHERE tablename IN ('board_posts','board_comments');` → 10.
  - is_member 정의에 `role` 필터 없음(=pending 포함) 확인.
- [ ] **Step 4: 수동 검증** — 비로그인 읽기 / 회원 닉네임 설정→글·댓글 작성 / 본인 수정·삭제 / 닉네임 미설정 시 작성 차단 / 기획단 숨김→공개 미표시·기획단 표시 / 로그아웃 상태 글쓰기 버튼 미노출.
- [ ] **Step 5** — main FF 머지 + push(사용자 승인).

## Self-Review
- Spec 커버: 접근(누구나 읽기/회원 쓰기)→Task1 RLS+is_member/requireMember. 단일게시판+글+댓글→T1·3·4·5·6·7. 닉네임(스냅샷·설정·필수)→T2·4·5·6. 모더레이션(본인/기획단)→T4·5·7. 페이지→T6·7. 헤더 링크→T8. 적용·검증→T9.
- Placeholder: 페이지(T6·7)는 완전 코드 대신 정밀 사양+기존 패턴(TimelineForm/meetings) 참조 — 각 페이지 책임·props·데이터흐름 명시. 액션/마이그/데이터/닉네임은 완전 코드.
- Type consistency: `requireMember`(supabase,user,memberId,nickname), `getMyMemberProfile`(memberId,nickname,isMember), 액션 시그니처, board 데이터 타입 일관.
- 알려진 결정: 닉네임 스냅샷(admin_members 공개 SELECT 불가), 기획단 완전삭제는 v1 숨김으로 갈음(후속 moderateDelete 여지).
