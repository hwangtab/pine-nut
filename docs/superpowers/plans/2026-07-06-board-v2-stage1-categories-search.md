# 게시판 v2 · 1단계(카테고리 + 검색) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** board_posts에 카테고리(자유/질문/제안/후기)를 추가하고, 목록에서 카테고리 필터 + 제목·본문 검색(ILIKE, 인젝션 안전)을 제공한다.

**Architecture:** 기존 게시판(공개읽기·회원쓰기·RLS) 위에 category 컬럼 1개 + 목록 페처 옵션(category/q). category는 board_posts의 일반 컬럼이라 기존 RLS가 커버. 검색은 사용자 입력을 새니타이즈해 PostgREST `.or()` 필터 인젝션을 차단.

**Tech Stack:** Next.js 16 App Router, React 19, TS(strict), Supabase, Tailwind v4.

## Global Constraints
- `website/`에서. 커밋 한국어 + `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. `git add`는 해당 파일만(`-A` 금지; untracked `website/COMPREHENSIVE_CODE_REVIEW.md`·`.claude/` 방치).
- 카테고리 허용값: **`'자유'`, `'질문'`, `'제안'`, `'후기'`** (기본 `'자유'`). DB CHECK + 앱 allowlist 이중.
- 검색: 사용자 입력을 PostgREST `.or()` 문자열에 넣기 전 예약문자 제거(`%_,()."*\`) — 인젝션 방지 필수.
- 서버액션 `ActionState = {error}|null`. 회원 게이트 `requireMember()`(기존). 검증 `npm run build`+`lint`.
- 마이그레이션 적용은 CLI(`supabase db push`), 사용자 승인 후.

## File Structure
생성:
- `website/supabase/migrations/20260706010001_board_category.sql`
수정:
- `website/src/lib/actions/board.ts` — `BOARD_CATEGORIES` 상수 + parse/create/update에 category
- `website/src/lib/data/board.ts` — `getBoardPosts(page, opts)` + `getBoardPost` category, 타입에 category
- `website/src/components/board/BoardPostForm.tsx` — 카테고리 select
- `website/src/app/board/new/page.tsx` / `[id]/edit/page.tsx` — initial category 전달(edit)
- `website/src/app/board/page.tsx` — 카테고리 필터 + 검색창 (searchParams category/q)
- `website/src/app/board/[id]/page.tsx` — 카테고리 배지

---

### Task 1: 마이그레이션 (category 컬럼)

**Files:** Create `website/supabase/migrations/20260706010001_board_category.sql`.

- [ ] **Step 1: 작성**
```sql
ALTER TABLE board_posts ADD COLUMN category TEXT NOT NULL DEFAULT '자유'
  CHECK (category IN ('자유','질문','제안','후기'));
CREATE INDEX idx_board_posts_category ON board_posts (category) WHERE NOT is_deleted;
```
- [ ] **Step 2: 점검** — `cd website && grep -c "category IN" supabase/migrations/20260706010001_board_category.sql` → 1.
- [ ] **Step 3: Commit** — stage only the file; msg "게시판 카테고리 마이그레이션: board_posts.category 추가".

---

### Task 2: 액션에 카테고리 (`board.ts`)

**Files:** Modify `website/src/lib/actions/board.ts`.
**Interfaces:** Produces `export const BOARD_CATEGORIES = ["자유","질문","제안","후기"] as const;` and `export type BoardCategory = (typeof BOARD_CATEGORIES)[number];`. create/update persist category.

- [ ] **Step 1: 상수 + parse 확장** — 파일 상단(imports 아래)에 추가:
```ts
export const BOARD_CATEGORIES = ["자유", "질문", "제안", "후기"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

function parseCategory(formData: FormData): BoardCategory {
  const raw = (formData.get("category") as string | null)?.trim() ?? "";
  return (BOARD_CATEGORIES as readonly string[]).includes(raw) ? (raw as BoardCategory) : "자유";
}
```
- [ ] **Step 2: createBoardPost** — insert에 category 추가:
```ts
    .insert({ author_user_id: gate.user.id, author_nickname: gate.nickname, title: parsed.title, content: parsed.content, category: parseCategory(formData) })
```
- [ ] **Step 3: updateBoardPost** — update에 category 추가:
```ts
    .from("board_posts").update({ title: parsed.title, content: parsed.content, category: parseCategory(formData) })
```
- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/actions/board.ts` → no errors.
- [ ] **Step 5: Commit** — msg "게시글 작성/수정에 카테고리 반영 + BOARD_CATEGORIES 상수".

---

### Task 3: 데이터 페처에 카테고리·검색 (`data/board.ts`)

**Files:** Modify `website/src/lib/data/board.ts`.
**Interfaces:** `getBoardPosts(page=1, opts?: { category?: string; q?: string }, perPage=20)`; `BoardPostListItem`/`BoardPostDetail`에 `category: string` 추가. `getBoardPost` selects category.

- [ ] **Step 1: 타입에 category 추가** — `BoardPostListItem`과 `BoardPostDetail`에 `category: string;` 추가. `PostRow`에 `category: string;` 추가.

- [ ] **Step 2: getBoardPosts 시그니처/쿼리 교체**
```ts
function sanitizeSearch(q: string): string {
  // PostgREST .or() 필터 예약문자 제거(인젝션 방지) 후 트림
  return q.replace(/[%_,()."*\\]/g, " ").replace(/\s+/g, " ").trim();
}

export async function getBoardPosts(
  page = 1,
  opts: { category?: string; q?: string } = {},
  perPage = 20,
): Promise<{ items: BoardPostListItem[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { items: [], total: 0 };
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("board_posts")
    .select("id, title, category, author_nickname, created_at, is_hidden, is_deleted, board_comments(count)", { count: "exact" })
    .order("created_at", { ascending: false });

  const category = opts.category;
  if (category && (["자유", "질문", "제안", "후기"] as string[]).includes(category)) {
    query = query.eq("category", category);
  }
  const q = sanitizeSearch(opts.q ?? "");
  if (q) {
    const pat = `%${q}%`;
    query = query.or(`title.ilike.${pat},content.ilike.${pat}`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error || !data) { console.error("getBoardPosts", error); return { items: [], total: 0 }; }
  return {
    items: (data as PostRow[]).map((r) => ({
      id: r.id, title: r.title, category: r.category, authorNickname: r.author_nickname, createdAt: r.created_at,
      commentCount: r.board_comments?.[0]?.count ?? 0, isHidden: r.is_hidden, isDeleted: r.is_deleted,
    })),
    total: count ?? 0,
  };
}
```
> `sanitizeSearch`가 예약문자를 공백으로 치환하므로 `pat`엔 `,`/`(`/`)`/`%`가 없어 `.or()` 문자열이 안전하다.

- [ ] **Step 3: getBoardPost에 category** — select 문자열에 `category` 추가, 반환 객체에 `category: p.category` 추가.

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit` → 이 시점엔 `getBoardPosts` 호출부(page.tsx)가 아직 옛 시그니처라 에러날 수 있음. page.tsx는 Task 5에서 갱신하므로, 이 태스크 단독 tsc는 호출부 에러만 남는다면 허용(호출부 외 이 파일 자체 에러는 0이어야 함). 파일 단위 확인: `npx eslint src/lib/data/board.ts` → no errors.
- [ ] **Step 5: Commit** — msg "게시판 페처에 카테고리 필터 + 안전 검색(ILIKE) 추가".

---

### Task 4: 폼에 카테고리 select (`BoardPostForm.tsx` + new/edit 페이지)

**Files:** Modify `website/src/components/board/BoardPostForm.tsx`, `website/src/app/board/new/page.tsx`, `website/src/app/board/[id]/edit/page.tsx`.
**Interfaces:** BoardPostForm props `initial?` 에 `category?: string` 추가.

- [ ] **Step 1: BoardPostForm** — props의 `initial` 타입에 `category?: string` 추가. title 입력 위(또는 아래)에 카테고리 select 추가:
```tsx
<div>
  <label htmlFor="category" className="block ...">카테고리</label>
  <select id="category" name="category" defaultValue={initial?.category ?? "자유"} className={selectCls}>
    <option value="자유">자유</option>
    <option value="질문">질문</option>
    <option value="제안">제안</option>
    <option value="후기">후기</option>
  </select>
</div>
```
(select 스타일은 기존 input 클래스에 `bg-[var(--color-admin-surface)]` 추가한 형태로.)

- [ ] **Step 2: edit 페이지** — `initial`에 category 전달: `initial={{ title: post.title, content: post.content, category: post.category }}` (post는 getBoardPost 결과, Task 3에서 category 포함).

- [ ] **Step 3: new 페이지** — 변경 불필요(기본 '자유'), 단 확인만.

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/components/board src/app/board/new src/app/board/[id]/edit` → no errors.
- [ ] **Step 5: Commit** — msg "게시글 폼에 카테고리 선택 추가".

---

### Task 5: 목록에 카테고리 필터 + 검색창 (`board/page.tsx`)

**Files:** Modify `website/src/app/board/page.tsx`.
**Interfaces:** Consumes `getBoardPosts(page, {category, q})`, `BOARD_CATEGORIES` (`@/lib/actions/board`).

- [ ] **Step 1: searchParams 확장 + 페처 호출**
```tsx
type SearchParams = Promise<{ page?: string; category?: string; q?: string }>;
export default async function BoardListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const category = sp.category ?? "";
  const q = sp.q ?? "";
  const { items, total } = await getBoardPosts(page, { category, q });
  // ...
}
```

- [ ] **Step 2: 카테고리 탭 + 검색폼 렌더** — 목록 위에:
  - 카테고리 탭: "전체"(category 없음) + BOARD_CATEGORIES 각각 → `<Link href={\`/board?category=${c}${q?\`&q=${encodeURIComponent(q)}\`:""}\`}>` 활성 표시.
  - 검색 폼: `<form method="get">` with hidden `category` (현재 필터 유지) + text input name="q" defaultValue={q} + 검색 버튼.
  - 각 글 행에 카테고리 배지(item.category) 표시.
  - 페이지네이션 링크에 category·q 유지(`?page=&category=&q=`).

- [ ] **Step 3: Verify** — `cd website && npx tsc --noEmit && npx eslint src/app/board/page.tsx && npm run build` → no errors; `/board` 빌드.
- [ ] **Step 4: Commit** — msg "게시판 목록에 카테고리 필터 + 검색창".

---

### Task 6: 상세에 카테고리 배지 (`board/[id]/page.tsx`)

**Files:** Modify `website/src/app/board/[id]/page.tsx`.

- [ ] **Step 1** — 제목 근처에 `post.category` 배지 표시(목록 배지와 동일 스타일, CSS 변수). getBoardPost가 category 포함(Task 3).
- [ ] **Step 2: Verify** — `cd website && npx tsc --noEmit && npx eslint src/app/board/[id]/page.tsx && npm run build` → no errors.
- [ ] **Step 3: Commit** — msg "게시판 상세에 카테고리 배지".

---

### Task 7: 빌드 + 마이그레이션 적용 + 배포

- [ ] **Step 1** — `cd website && npm run build && npm run lint` → 성공.
- [ ] **Step 2 (사용자 승인 후)** — `supabase migration list`로 `20260706010001`만 미적용 확인 → `supabase db push`.
- [ ] **Step 3 (적용 후 감사, CLI)** — `supabase db query --linked "SELECT count(*) FROM pg_constraint WHERE conname LIKE 'board_posts_category%'"` 또는 컬럼 존재 확인; 기존 글은 기본 '자유'로 채워졌는지 `SELECT category, count(*) FROM board_posts GROUP BY category;`.
- [ ] **Step 4: 수동 검증** — 글 작성 시 카테고리 선택 저장 / 목록 카테고리 탭 필터 / 검색어 입력(제목·본문 매칭) / 검색어에 `%`,`(` 등 넣어도 오류·인젝션 없이 동작.
- [ ] **Step 5** — main FF 머지 + push(사용자 승인).

## Self-Review
- Spec 1단계 커버: 카테고리(컬럼·폼·필터·배지)→T1·2·4·5·6; 검색(안전 ILIKE)→T3·5. 순서·인젝션 방지 반영.
- Placeholder 없음. Task3 Step4에 "호출부는 T5에서 갱신" 명시(중간 tsc 에러 사유).
- Type consistency: `BOARD_CATEGORIES`/`BoardCategory`(T2) → T5 소비; `getBoardPosts(page,opts,perPage)`·`category` 필드(T3) → T4·5·6 소비. getBoardPost category → edit initial·상세 배지.
- 알려진 결정: 검색은 sanitize 후 `.or` ILIKE(전문검색 아님, 소규모 충분); 카테고리 '공지'는 비범위(4개 고정).
