# 게시판 v2 · 4단계(신고 + 검토큐) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 회원이 글/댓글을 사유와 함께 신고하고, 기획단(editor+)이 `/admin/board-reports` 검토큐에서 대상별로 확인·해결/무시한다. 중복 신고 방지.

**Architecture:** board_reports 테이블(UNIQUE(target_type,target_id,reporter_user_id)) + RLS(회원 INSERT 본인, editor+ SELECT/UPDATE). 신고 액션 `reportTarget`, 큐 상태변경 `resolveReports`. 데이터는 editor 전용 SELECT로 전체 신고를 읽어 대상별로 JS 그룹핑(저볼륨). 신고 버튼(상세 글·댓글), 관리자 큐 페이지 + 사이드바 링크.

**Tech Stack:** Next.js 16 App Router, React 19, TS(strict), Supabase, Tailwind v4.

## Global Constraints
- `website/`에서. 커밋 한국어 + `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. `git add`는 해당 파일만(`-A` 금지; untracked `website/COMPREHENSIVE_CODE_REVIEW.md`·`.claude/` 방치).
- 신고 대상: `target_type ∈ ('post','comment')`. 사유 preset: **스팸/광고, 욕설/비방, 부적절한 내용, 기타**. 상태: `pending/resolved/dismissed`.
- **중복신고 방지**: `UNIQUE(target_type, target_id, reporter_user_id)`가 최종 방어(23505 → 친화적).
- 회원 게이트 `requireMember()`, 큐/상태변경 `requireEditor()`(editor+). 큐 SELECT는 RLS `admin_can_edit()`.
- 서버액션 `ActionState={error}|null`. 검증 `npm run build`+`lint`. 마이그레이션 CLI, 사용자 승인 후.

## File Structure
생성:
- `website/supabase/migrations/20260707010001_board_reports.sql`
- `website/src/lib/data/board-reports.ts` — `getReportQueue()`
- `website/src/app/board/[id]/ReportButton.tsx` — 신고 버튼(사유 선택)
- `website/src/app/admin/board-reports/page.tsx` — 검토큐(editor+)
- `website/src/app/admin/board-reports/ReportsManager.tsx` — 큐 클라이언트(해결/무시)
수정:
- `website/src/lib/actions/board.ts` — `reportTarget`, `resolveReports`
- `website/src/app/board/[id]/page.tsx` — 글에 ReportButton
- `website/src/app/board/[id]/CommentSection.tsx` — 댓글에 ReportButton
- `website/src/components/admin/AdminSidebar.tsx` — "게시판 신고" 링크(editor+)

---

### Task 1: 마이그레이션 (board_reports)

**Files:** Create `website/supabase/migrations/20260707010001_board_reports.sql`.
**Interfaces:** Produces table `board_reports`.

- [ ] **Step 1: 작성**
```sql
CREATE TABLE IF NOT EXISTS board_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('post','comment')),
  target_id BIGINT NOT NULL,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_type, target_id, reporter_user_id)
);
CREATE INDEX idx_board_reports_status ON board_reports (status, created_at DESC);

ALTER TABLE board_reports ENABLE ROW LEVEL SECURITY;

-- 회원 본인 신고 삽입
CREATE POLICY "board_reports_member_insert" ON board_reports
  FOR INSERT TO authenticated WITH CHECK (is_member() AND reporter_user_id = auth.uid());
-- 기획단만 큐 열람/상태변경
CREATE POLICY "board_reports_editor_read" ON board_reports
  FOR SELECT TO authenticated USING (admin_can_edit());
CREATE POLICY "board_reports_editor_update" ON board_reports
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
```
- [ ] **Step 2: 점검** — `cd website && grep -c "CREATE POLICY" supabase/migrations/20260707010001_board_reports.sql` → 3. `grep -c "UNIQUE (target_type" ...` → 1.
- [ ] **Step 3: Commit** — stage only the file; msg "게시판 신고 마이그레이션: board_reports + RLS".

---

### Task 2: 신고/상태변경 액션 + 큐 데이터

**Files:** Modify `website/src/lib/actions/board.ts`; Create `website/src/lib/data/board-reports.ts`.
**Interfaces:** Produces `reportTarget(targetType: "post" | "comment", targetId: number, reason: string): Promise<ActionState>`; `resolveReports(targetType: "post" | "comment", targetId: number, status: "resolved" | "dismissed"): Promise<ActionState>`; `getReportQueue(): Promise<ReportGroup[]>` (`ReportGroup = { targetType: "post"|"comment"; targetId: number; postId: number; reportCount: number; reasons: string[]; hasPending: boolean; latestAt: string; snippet: string }`).

- [ ] **Step 1: 액션 (board.ts 끝에 추가)**
```ts
const REPORT_REASONS = ["스팸/광고", "욕설/비방", "부적절한 내용", "기타"];

export async function reportTarget(targetType: "post" | "comment", targetId: number, reason: string): Promise<ActionState> {
  if (!REPORT_REASONS.includes(reason)) return { error: "신고 사유를 선택해주세요." };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  const { error } = await gate.supabase
    .from("board_reports")
    .insert({ target_type: targetType, target_id: targetId, reporter_user_id: gate.user.id, reason });
  if (error) {
    if (error.code === "23505") return { error: "이미 신고하셨습니다." };
    return { error: "신고에 실패했습니다." };
  }
  return null;
}

export async function resolveReports(targetType: "post" | "comment", targetId: number, status: "resolved" | "dismissed"): Promise<ActionState> {
  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const { error } = await gate.supabase
    .from("board_reports").update({ status })
    .eq("target_type", targetType).eq("target_id", targetId).eq("status", "pending");
  if (error) return { error: "처리에 실패했습니다." };
  await logAudit(gate.supabase, "board_reports", targetId, "update", { payload: { targetType, status } });
  revalidatePath("/admin/board-reports");
  return null;
}
```

- [ ] **Step 2: 큐 데이터** — Create `website/src/lib/data/board-reports.ts`:
```ts
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface ReportGroup {
  targetType: "post" | "comment"; targetId: number; postId: number;
  reportCount: number; reasons: string[]; hasPending: boolean; latestAt: string; snippet: string;
}

interface ReportRow { target_type: "post" | "comment"; target_id: number; reason: string; status: string; created_at: string; }

export async function getReportQueue(): Promise<ReportGroup[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  // RLS: admin_can_edit()만 읽힘
  const { data, error } = await supabase
    .from("board_reports")
    .select("target_type, target_id, reason, status, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) { if (error) console.error("getReportQueue", error); return []; }
  const rows = data as ReportRow[];

  // 대상별 그룹핑
  const groups = new Map<string, { g: ReportGroup }>();
  for (const r of rows) {
    const key = `${r.target_type}:${r.target_id}`;
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { g: {
        targetType: r.target_type, targetId: r.target_id, postId: 0,
        reportCount: 1, reasons: [r.reason], hasPending: r.status === "pending",
        latestAt: r.created_at, snippet: "",
      }});
    } else {
      existing.g.reportCount += 1;
      if (!existing.g.reasons.includes(r.reason)) existing.g.reasons.push(r.reason);
      if (r.status === "pending") existing.g.hasPending = true;
      if (r.created_at > existing.g.latestAt) existing.g.latestAt = r.created_at;
    }
  }
  const list = [...groups.values()].map((v) => v.g);

  // 댓글 대상의 post_id 배치 조회 + 스니펫(제목/댓글내용)
  const postIds = list.filter((g) => g.targetType === "post").map((g) => g.targetId);
  const commentIds = list.filter((g) => g.targetType === "comment").map((g) => g.targetId);
  const commentPost = new Map<number, number>();
  if (commentIds.length) {
    const { data: cs } = await supabase.from("board_comments").select("id, post_id, content").in("id", commentIds);
    for (const c of (cs ?? []) as { id: number; post_id: number; content: string }[]) {
      commentPost.set(c.id, c.post_id);
      const g = list.find((x) => x.targetType === "comment" && x.targetId === c.id);
      if (g) { g.postId = c.post_id; g.snippet = c.content.slice(0, 60); }
    }
  }
  if (postIds.length || commentPost.size) {
    const allPostIds = [...new Set([...postIds, ...commentPost.values()])];
    const { data: ps } = await supabase.from("board_posts").select("id, title").in("id", allPostIds);
    const titleMap = new Map<number, string>();
    for (const p of (ps ?? []) as { id: number; title: string }[]) titleMap.set(p.id, p.title);
    for (const g of list) {
      if (g.targetType === "post") { g.postId = g.targetId; g.snippet = titleMap.get(g.targetId) ?? "(삭제됨)"; }
    }
  }
  // 미해결 우선, 최신순
  return list.sort((a, b) => (Number(b.hasPending) - Number(a.hasPending)) || b.latestAt.localeCompare(a.latestAt));
}
```

- [ ] **Step 3: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/actions/board.ts src/lib/data/board-reports.ts` → no errors.
- [ ] **Step 4: Commit** — stage the 2 files; msg "게시판 신고/상태변경 액션 + 검토큐 데이터".

---

### Task 3: 신고 버튼 (상세 글 + 댓글)

**Files:** Create `website/src/app/board/[id]/ReportButton.tsx`; Modify `website/src/app/board/[id]/page.tsx`, `website/src/app/board/[id]/CommentSection.tsx`.
**Interfaces:** Consumes `reportTarget` (Task 2).

- [ ] **Step 1: ReportButton** — Create `.../ReportButton.tsx` ("use client"): props `{ targetType: "post" | "comment"; targetId: number; canReport: boolean }`.
  - 버튼 "신고". 클릭 시(canReport false면 `router.push("/login")`) 사유 선택 UI 토글(select: 스팸/광고·욕설/비방·부적절한 내용·기타 + "제출"). 제출 시 useTransition으로 `reportTarget(targetType, targetId, reason)` 호출 → 성공 시 "신고되었습니다" 표시(2초) + 닫기, 실패 시 에러(예: "이미 신고하셨습니다"). CSS 변수, 작은 텍스트 버튼.

- [ ] **Step 2: 상세 글에 배치** — `board/[id]/page.tsx`: 좋아요 버튼 근처(BoardPostActions 옆)에 `<ReportButton targetType="post" targetId={id} canReport={canWrite} />`. (`canWrite`=회원.)

- [ ] **Step 3: 댓글에 배치** — `CommentSection.tsx`: 각 댓글 액션 영역(삭제/숨김 옆)에 `<ReportButton targetType="comment" targetId={c.id} canReport={canWrite} />`. (canWrite prop이 이미 CommentSection에 있으면 사용; 없으면 prop 추가해 page.tsx에서 `canWrite` 전달.) 본인 댓글엔 신고 버튼 숨김(선택: `meUserId !== c.authorUserId`일 때만).

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/app/board && npm run build` → no errors.
- [ ] **Step 5: Commit** — stage the 3 files; msg "게시판 신고 버튼(글/댓글)".

---

### Task 4: 관리자 검토큐 + 사이드바 링크

**Files:** Create `website/src/app/admin/board-reports/page.tsx`, `website/src/app/admin/board-reports/ReportsManager.tsx`; Modify `website/src/components/admin/AdminSidebar.tsx`.
**Interfaces:** Consumes `getReportQueue` (Task 2), `resolveReports` (Task 2), `setPostHidden`/`setCommentHidden` (기존).

- [ ] **Step 1: 큐 페이지(editor+ 게이트)** — Create `admin/board-reports/page.tsx` (server):
```tsx
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/actions/auth";
import { getReportQueue } from "@/lib/data/board-reports";
import ReportsManager from "./ReportsManager";

export default async function BoardReportsPage() {
  const ctx = await getAdminContext();
  if (ctx.role !== "owner" && ctx.role !== "editor") redirect("/admin");
  const groups = await getReportQueue();
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-6">게시판 신고</h1>
      <ReportsManager groups={groups} />
    </div>
  );
}
```

- [ ] **Step 2: ReportsManager** — Create `admin/board-reports/ReportsManager.tsx` ("use client"): props `{ groups: ReportGroup[] }`(import type from `@/lib/data/board-reports`).
  - 각 그룹 카드: 대상 유형 배지(글/댓글) + 스니펫 + 사유들 + 신고 수 + 미해결 배지. "내용 보기" Link → 글은 `/board/${postId}`, 댓글은 `/board/${postId}`(같은 글). 
  - 액션(useTransition): "숨김 처리"(글이면 `setPostHidden(targetId, true)`, 댓글이면 `setCommentHidden(targetId, postId, true)`), "해결"(`resolveReports(targetType, targetId, "resolved")`), "무시"(`resolveReports(targetType, targetId, "dismissed")`) → 각 성공 시 `router.refresh()`. 에러 표시. CSS 변수(admin 토큰).
  - 빈 상태 "신고가 없습니다."

- [ ] **Step 3: 사이드바 링크(editor+)** — `AdminSidebar.tsx`: `navItems` 계산을 editor+에게 "게시판 신고" 링크를 포함하도록 확장. 현재 owner만 기획단 링크를 받으므로, 다음처럼 조정:
```tsx
  const items = [...baseNavItems];
  if (role === "owner" || role === "editor") items.push({ href: "/admin/board-reports", label: "게시판 신고", icon: Flag });
  if (role === "owner") items.push({ href: "/admin/members", label: "기획단", icon: UserCog });
  const navItems = items;
```
`Flag`를 lucide-react import에 추가. (기존 owner 기획단 링크 동작은 유지.)

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/app/admin/board-reports src/components/admin/AdminSidebar.tsx && npm run build` → no errors; `/admin/board-reports` 빌드.
- [ ] **Step 5: Commit** — stage the 3 files; msg "게시판 신고 검토큐(/admin/board-reports) + 사이드바 링크".

---

### Task 5: 빌드 + 마이그레이션 적용 + 배포

- [ ] **Step 1** — `cd website && npm run build && npm run lint` → 성공.
- [ ] **Step 2 (사용자 승인 후)** — `supabase migration list`로 `20260707010001`만 미적용 확인 → `supabase db push`.
- [ ] **Step 3 (적용 후 감사, CLI)** — `supabase db query --linked "SELECT (SELECT count(*) FROM pg_policies WHERE tablename='board_reports') AS policies, (SELECT count(*) FROM pg_policies WHERE tablename='board_reports' AND cmd='SELECT' AND qual LIKE '%admin_can_edit%') AS editor_read, (SELECT count(*) FROM pg_constraint WHERE conname LIKE 'board_reports%' AND contype='u') AS unique_c;"` → 3 / 1 / 1.
- [ ] **Step 4: 수동 검증** — 회원이 글/댓글 신고(사유) / 같은 대상 재신고 시 "이미 신고" / 비회원 신고 시 로그인 / editor가 `/admin/board-reports`에서 큐 확인·숨김·해결/무시 / viewer·비관리자는 큐 접근 시 /admin 리다이렉트 / 사이드바 링크 editor+에게만.
- [ ] **Step 5** — main FF 머지 + push(사용자 승인).

## Self-Review
- Spec 4.5 커버: 테이블+UNIQUE+RLS(T1), 신고/상태 액션+큐데이터(T2), 신고 버튼 글·댓글(T3), 관리자 큐+숨김재사용+사이드바(T4), 적용/검증(T5).
- Placeholder 없음. 큐는 저볼륨 가정 JS 그룹핑(명시). 댓글 신고 post_id 배치 조회.
- Type consistency: `reportTarget`/`resolveReports`/`getReportQueue`·`ReportGroup`(T2) → T3·T4 소비. setPostHidden(id,hidden)/setCommentHidden(id,postId,hidden) 기존 재사용.
- 알려진 결정: 큐는 대상별 그룹(신고 수). 숨김은 기존 모더 액션 재사용. 자동 임계치 숨김·알림은 비범위.
