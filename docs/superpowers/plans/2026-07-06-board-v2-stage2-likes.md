# 게시판 v2 · 2단계(좋아요) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 게시글에 좋아요(회원 1인 1회 토글)를 추가하고, 목록·상세에 좋아요 수를 표시한다.

**Architecture:** board_post_likes 테이블(UNIQUE(post_id,user_id)) + RLS(공개 SELECT, 회원 INSERT/DELETE). 서버액션 `togglePostLike`가 있으면 삭제/없으면 삽입. 데이터 페처가 likeCount(집계) + likedByMe(현재 사용자)를 제공. 상세에 하트 토글, 목록에 수 표시.

**Tech Stack:** Next.js 16 App Router, React 19, TS(strict), Supabase, Tailwind v4.

## Global Constraints
- `website/`에서. 커밋 한국어 + `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. `git add`는 해당 파일만(`-A` 금지; untracked `website/COMPREHENSIVE_CODE_REVIEW.md`·`.claude/` 방치).
- PK `BIGINT IDENTITY`. 서버액션 `ActionState={error}|null`. 회원 게이트 `requireMember()`(pending 포함). `.or()` 문자열 인젝션 금지(이번엔 검색 없음).
- **좋아요 멱등성**: `UNIQUE(post_id, user_id)`가 최종 방어. author_user_id 아님 — 좋아요는 user_id.
- 검증 `npm run build`+`lint`. 마이그레이션 적용은 CLI(`supabase db push`), 사용자 승인 후.

## File Structure
생성:
- `website/supabase/migrations/20260706020001_board_post_likes.sql`
- `website/src/app/board/[id]/LikeButton.tsx` (client)
수정:
- `website/src/lib/actions/board.ts` — `togglePostLike(postId)`
- `website/src/lib/data/board.ts` — likeCount(list/detail) + `hasLikedPost(postId)`; 타입에 likeCount
- `website/src/app/board/[id]/page.tsx` — LikeButton 배치(likeCount/likedByMe 전달)
- `website/src/app/board/page.tsx` — 목록 행에 좋아요 수 표시

---

### Task 1: 마이그레이션 (board_post_likes)

**Files:** Create `website/supabase/migrations/20260706020001_board_post_likes.sql`.
**Interfaces:** Produces table `board_post_likes`.

- [ ] **Step 1: 작성**
```sql
CREATE TABLE IF NOT EXISTS board_post_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
CREATE INDEX idx_board_post_likes_post ON board_post_likes (post_id);

ALTER TABLE board_post_likes ENABLE ROW LEVEL SECURITY;

-- 집계용 공개 읽기
CREATE POLICY "board_post_likes_public_read" ON board_post_likes
  FOR SELECT TO anon, authenticated USING (true);
-- 회원 본인만 추가/삭제
CREATE POLICY "board_post_likes_member_insert" ON board_post_likes
  FOR INSERT TO authenticated WITH CHECK (is_member() AND user_id = auth.uid());
CREATE POLICY "board_post_likes_member_delete" ON board_post_likes
  FOR DELETE TO authenticated USING (is_member() AND user_id = auth.uid());
```
- [ ] **Step 2: 점검** — `cd website && grep -c "CREATE POLICY" supabase/migrations/20260706020001_board_post_likes.sql` → 3. `grep -c "UNIQUE (post_id, user_id)" ...` → 1.
- [ ] **Step 3: Commit** — stage only the file; msg "게시판 좋아요 마이그레이션: board_post_likes + RLS".

---

### Task 2: togglePostLike 액션 + 데이터(likeCount/likedByMe)

**Files:** Modify `website/src/lib/actions/board.ts`, `website/src/lib/data/board.ts`.
**Interfaces:** Produces `togglePostLike(postId: number): Promise<ActionState>`; `hasLikedPost(postId: number): Promise<boolean>`; `BoardPostListItem`/`BoardPostDetail`에 `likeCount: number`.

- [ ] **Step 1: `togglePostLike` (board.ts 끝에 추가)**
```ts
export async function togglePostLike(postId: number): Promise<ActionState> {
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  const { data: existing } = await gate.supabase
    .from("board_post_likes").select("id").eq("post_id", postId).eq("user_id", gate.user.id).maybeSingle();
  if (existing) {
    const { error } = await gate.supabase.from("board_post_likes").delete().eq("id", existing.id);
    if (error) return { error: "처리에 실패했습니다." };
  } else {
    const { error } = await gate.supabase
      .from("board_post_likes").insert({ post_id: postId, user_id: gate.user.id });
    // UNIQUE 위반(동시요청)은 이미 눌린 상태이므로 무시
    if (error && !error.message.includes("duplicate")) return { error: "처리에 실패했습니다." };
  }
  revalidatePath("/board");
  revalidatePath(`/board/${postId}`);
  return null;
}
```

- [ ] **Step 2: 타입에 likeCount** — `BoardPostListItem`과 `BoardPostDetail`에 `likeCount: number;` 추가. `PostRow`에 `board_post_likes?: { count: number }[];` 추가.

- [ ] **Step 3: getBoardPosts select/map에 likeCount** — select 문자열에 `board_post_likes(count)` 추가; 매핑에 `likeCount: r.board_post_likes?.[0]?.count ?? 0,` 추가.

- [ ] **Step 4: getBoardPost select/return에 likeCount** — select 문자열에 `board_post_likes(count)` 추가(중첩); return 객체에 `likeCount: (p as unknown as { board_post_likes?: { count: number }[] }).board_post_likes?.[0]?.count ?? 0,` 추가. (또는 p 타입을 확장해 접근.)

- [ ] **Step 5: `hasLikedPost` (data/board.ts 끝에 추가)**
```ts
export async function hasLikedPost(postId: number): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("board_post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  return !!data;
}
```

- [ ] **Step 6: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/actions/board.ts src/lib/data/board.ts` → no errors.
- [ ] **Step 7: Commit** — stage the 2 files; msg "좋아요 토글 액션 + likeCount/likedByMe 데이터".

---

### Task 3: LikeButton + 상세/목록 UI

**Files:** Create `website/src/app/board/[id]/LikeButton.tsx`; Modify `website/src/app/board/[id]/page.tsx`, `website/src/app/board/page.tsx`.
**Interfaces:** Consumes `togglePostLike` (Task 2), `getBoardPost`(likeCount), `hasLikedPost` (Task 2).

- [ ] **Step 1: LikeButton** — Create `website/src/app/board/[id]/LikeButton.tsx` ("use client"):
```tsx
"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { togglePostLike } from "@/lib/actions/board";

export default function LikeButton({ postId, count, liked, canLike }: { postId: number; count: number; liked: boolean; canLike: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!canLike) { router.push("/login"); return; }
    setError(null);
    startTransition(async () => {
      const res = await togglePostLike(postId);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onClick} disabled={pending} aria-pressed={liked}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${liked ? "border-[var(--color-warm)] bg-[var(--color-warm)]/10 text-[var(--color-warm)]" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"}`}>
        <Heart size={16} className={liked ? "fill-current" : ""} />
        <span>{count}</span>
      </button>
      {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
    </div>
  );
}
```
> lucide-react `Heart`, CSS 변수는 상세 페이지가 쓰는 토큰(`--color-warm`/`--color-border`/`--color-text-muted`/`--color-bg`/`--color-danger`)과 일치시킬 것. 실제 존재하는 토큰인지 상세 페이지의 기존 클래스에서 확인 후 맞춤.

- [ ] **Step 2: 상세 페이지에 배치** — `board/[id]/page.tsx`: `getBoardPost` 외에 `const liked = await hasLikedPost(id);` 호출(Promise.all에 포함 가능). 본문 아래(또는 BoardPostActions 근처)에 `<LikeButton postId={id} count={post.likeCount} liked={liked} canLike={canWrite} />`. (`canWrite`는 이미 계산됨 = 회원 여부.)

- [ ] **Step 3: 목록에 좋아요 수 표시** — `board/page.tsx`: 각 행의 메타(댓글 수 옆)에 `item.likeCount` 표시(하트 아이콘 + 수, 읽기 전용 텍스트). 토글 없음.

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/app/board && npm run build` → no errors; `/board`,`/board/[id]` 빌드.
- [ ] **Step 5: Commit** — stage the 3 files; msg "좋아요 버튼(상세 토글) + 목록 좋아요 수 표시".

---

### Task 4: 빌드 + 마이그레이션 적용 + 배포

- [ ] **Step 1** — `cd website && npm run build && npm run lint` → 성공.
- [ ] **Step 2 (사용자 승인 후)** — `supabase migration list`로 `20260706020001`만 미적용 확인 → `supabase db push`.
- [ ] **Step 3 (적용 후 감사, CLI)** — `supabase db query --linked "SELECT count(*) FROM pg_policies WHERE tablename='board_post_likes'"` → 3; UNIQUE 제약 존재 확인.
- [ ] **Step 4: 수동 검증** — 회원 로그인 → 상세에서 하트 토글(수 증가/감소), 새로고침 유지 / 다시 눌러 취소 / 비로그인은 클릭 시 /login / 목록에 좋아요 수 표시 / 같은 글 두 번 좋아요 안 됨(멱등).
- [ ] **Step 5** — main FF 머지 + push(사용자 승인).

## Self-Review
- Spec 4.3 커버: 테이블+UNIQUE+RLS(T1), 토글 액션+집계+likedByMe(T2), 하트 토글 상세+목록 수(T3), 적용/검증(T4). 좋아요는 글에만(댓글 아님).
- Placeholder 없음. LikeButton CSS 토큰은 상세 페이지 기존 토큰 확인 후 맞추라 명시.
- Type consistency: `togglePostLike(postId)`/`hasLikedPost(postId)`/`likeCount`(T2) → T3 소비 일치. UNIQUE는 user_id 기준(author 아님).
- 알려진 결정: 좋아요순 정렬·댓글 좋아요는 비범위. 목록 토글 없음(상세만).
