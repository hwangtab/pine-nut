# 게시판 v2 · 3단계(이미지 첨부) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 게시글에 이미지 여러 장을 첨부(작성자/기획단)하고 상세에서 공개로 표시한다. 업로드는 글 편집 화면에서(글이 존재해야 함), 삭제는 업로더 본인/기획단.

**Architecture:** 공개 버킷 `board-images` + `board_post_images` 메타 테이블. 업로드/삭제는 서버액션(회원+본인글 or editor). 스토리지 삭제 권한은 `storage.objects.owner = auth.uid()`(업로더)로 처리. 상세 페처가 이미지 공개 URL 목록을 제공. 편집 페이지에 이미지 관리 섹션(meeting-attachments 패턴).

**Tech Stack:** Next.js 16 App Router, React 19, TS(strict), Supabase Storage, Tailwind v4.

## Global Constraints
- `website/`에서. 커밋 한국어 + `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. `git add`는 해당 파일만(`-A` 금지; untracked `website/COMPREHENSIVE_CODE_REVIEW.md`·`.claude/` 방치).
- 이미지: **jpg/png/webp, 5MB 이하**, 서버측 MIME/용량 검증. 경로 `${postId}/${uuid}.ext`(사용자 입력 미포함). 삽입 실패 시 스토리지 롤백(고아 방지).
- 버킷 `board-images` **public**(공개 읽기). INSERT=회원, DELETE=업로더 본인(`owner=auth.uid()`) 또는 editor+.
- `board_post_images` RLS: SELECT 공개; INSERT/DELETE=글 작성자 또는 editor+.
- 서버액션 `ActionState={error}|null`. 회원 게이트 `requireMember()`. 검증 `npm run build`+`lint`. 마이그레이션 CLI, 사용자 승인 후.

## File Structure
생성:
- `website/supabase/migrations/20260706030001_board_images.sql`
- `website/src/app/board/[id]/edit/BoardImageManager.tsx` (client, 편집 페이지용 업로드/목록/삭제)
수정:
- `website/src/lib/actions/board.ts` — `uploadBoardImage`, `deleteBoardImage`
- `website/src/lib/data/board.ts` — getBoardPost가 `images: {id,url,sortOrder}[]` 반환; `BoardImage` 타입
- `website/src/app/board/[id]/edit/page.tsx` — BoardImageManager 배치(post.images 전달)
- `website/src/app/board/[id]/page.tsx` — 상세에 이미지 표시

---

### Task 1: 마이그레이션 (board_post_images + board-images 버킷 + 정책)

**Files:** Create `website/supabase/migrations/20260706030001_board_images.sql`.
**Interfaces:** Produces table `board_post_images`, bucket `board-images`.

- [ ] **Step 1: 작성**
```sql
-- ==================== board_post_images ====================
CREATE TABLE IF NOT EXISTS board_post_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_board_post_images_post ON board_post_images (post_id, sort_order);

ALTER TABLE board_post_images ENABLE ROW LEVEL SECURITY;

-- 공개 읽기
CREATE POLICY "board_post_images_public_read" ON board_post_images
  FOR SELECT TO anon, authenticated USING (true);
-- 글 작성자 또는 기획단만 추가/삭제
CREATE POLICY "board_post_images_author_insert" ON board_post_images
  FOR INSERT TO authenticated WITH CHECK (
    is_member() AND (
      EXISTS (SELECT 1 FROM board_posts p WHERE p.id = post_id AND p.author_user_id = auth.uid())
      OR admin_can_edit()
    )
  );
CREATE POLICY "board_post_images_author_delete" ON board_post_images
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM board_posts p WHERE p.id = post_id AND p.author_user_id = auth.uid())
    OR admin_can_edit()
  );

-- ==================== board-images 공개 버킷 ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-images', 'board-images', true)
ON CONFLICT (id) DO NOTHING;

-- 공개 읽기
CREATE POLICY "board_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'board-images');
-- 회원 업로드
CREATE POLICY "board_images_member_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'board-images' AND is_member());
-- 업로더 본인 또는 기획단 삭제 (owner = 업로드한 auth.uid())
CREATE POLICY "board_images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'board-images' AND (owner = auth.uid() OR admin_can_edit()));
```
- [ ] **Step 2: 점검** — `cd website && grep -c "CREATE POLICY" supabase/migrations/20260706030001_board_images.sql` → 6. `grep -c "board-images" ...` → ≥ 4.
- [ ] **Step 3: Commit** — stage only the file; msg "게시판 이미지 마이그레이션: board_post_images + board-images 버킷 + RLS".

---

### Task 2: 업로드/삭제 액션 + 상세 이미지 데이터

**Files:** Modify `website/src/lib/actions/board.ts`, `website/src/lib/data/board.ts`.
**Interfaces:** Produces `uploadBoardImage(postId: number, _prev: ActionState, formData: FormData): Promise<ActionState>` (field `image_file`), `deleteBoardImage(imageId: number, postId: number): Promise<ActionState>`; `getBoardPost`에 `images: BoardImage[]`(`{ id: number; url: string; sortOrder: number }`).

- [ ] **Step 1: 액션 (board.ts 끝에 추가)**
```ts
const BOARD_IMAGE_BUCKET = "board-images";
const BOARD_IMAGE_MAX = 5 * 1024 * 1024;
const BOARD_IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function uploadBoardImage(postId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get("image_file");
  if (!(file instanceof File) || file.size === 0) return { error: "이미지를 선택해주세요." };
  const ext = BOARD_IMAGE_TYPES[file.type];
  if (!ext) return { error: "JPG, PNG, WebP 형식만 올릴 수 있습니다." };
  if (file.size > BOARD_IMAGE_MAX) return { error: "이미지는 5MB 이하만 가능합니다." };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };

  const path = `${postId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await gate.supabase.storage.from(BOARD_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { error: "이미지 업로드에 실패했습니다." };

  // 정렬 순서: 현재 개수
  const { count } = await gate.supabase.from("board_post_images").select("id", { count: "exact", head: true }).eq("post_id", postId);
  const { error: insErr } = await gate.supabase.from("board_post_images")
    .insert({ post_id: postId, storage_path: path, sort_order: count ?? 0 });
  if (insErr) {
    // 작성자 아님(RLS) 등 실패 시 업로드한 파일 정리
    await gate.supabase.storage.from(BOARD_IMAGE_BUCKET).remove([path]);
    return { error: "이미지 등록에 실패했습니다. (본인 글에만 첨부 가능)" };
  }
  revalidatePath(`/board/${postId}`);
  revalidatePath(`/board/${postId}/edit`);
  return null;
}

export async function deleteBoardImage(imageId: number, postId: number): Promise<ActionState> {
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  const { data: row } = await gate.supabase.from("board_post_images").select("storage_path").eq("id", imageId).maybeSingle();
  if (!row) return { error: "이미지를 찾을 수 없습니다." };
  // 행 삭제(RLS: 작성자/기획단). 성공 시 스토리지도 정리(owner/editor 정책).
  const { error: delErr } = await gate.supabase.from("board_post_images").delete().eq("id", imageId);
  if (delErr) return { error: "삭제에 실패했습니다." };
  const { error: stErr } = await gate.supabase.storage.from(BOARD_IMAGE_BUCKET).remove([row.storage_path]);
  if (stErr) console.error("board image storage remove:", stErr);
  revalidatePath(`/board/${postId}`);
  revalidatePath(`/board/${postId}/edit`);
  return null;
}
```

- [ ] **Step 2: 데이터 — getBoardPost가 images 반환**
  - `data/board.ts`에 타입 `export interface BoardImage { id: number; url: string; sortOrder: number; }` 추가. `BoardPostDetail`에 `images: BoardImage[];` 추가.
  - `getBoardPost` select에 `board_post_images(id, storage_path, sort_order)` 추가.
  - 반환에 images 매핑 — 공개 URL 계산:
    ```ts
    const rawImages = (p as unknown as { board_post_images?: { id: number; storage_path: string; sort_order: number }[] }).board_post_images ?? [];
    const images: BoardImage[] = rawImages
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((im) => ({ id: im.id, sortOrder: im.sort_order, url: supabase.storage.from("board-images").getPublicUrl(im.storage_path).data.publicUrl }));
    ```
    (return 객체에 `images` 추가.)

- [ ] **Step 3: next.config 이미지 호스트** — board-images는 Supabase 공개 URL(`<project>.supabase.co/storage/v1/object/public/board-images/...`). 상세에서 `<img>` 기본 태그를 쓰면 next/image 원격 허용 불필요. **plan 결정: 게시판 이미지는 일반 `<img>` 태그로 표시**(next/image 원격 호스트 등록 회피, 단순). CLAUDE.md의 next/image 규칙은 콘텐츠 이미지 대상이며, 사용자 업로드 게시판 이미지는 `<img>` 허용으로 간주. (lint에서 `@next/next/no-img-element` 경고 시 해당 라인 `eslint-disable-next-line`.)

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/lib/actions/board.ts src/lib/data/board.ts` → no errors.
- [ ] **Step 5: Commit** — stage the 2 files; msg "게시판 이미지 업로드/삭제 액션 + 상세 이미지 데이터".

---

### Task 3: 편집 이미지 관리자 + 상세 이미지 표시

**Files:** Create `website/src/app/board/[id]/edit/BoardImageManager.tsx`; Modify `website/src/app/board/[id]/edit/page.tsx`, `website/src/app/board/[id]/page.tsx`.
**Interfaces:** Consumes `uploadBoardImage`/`deleteBoardImage` (Task 2), `getBoardPost`(images) (Task 2).

- [ ] **Step 1: BoardImageManager** — Create `.../edit/BoardImageManager.tsx` ("use client"): props `{ postId: number; images: { id: number; url: string }[] }`. 
  - 업로드 폼: `useActionState(uploadBoardImage.bind(null, postId), null)` + `<input type="file" name="image_file" accept="image/jpeg,image/png,image/webp" />` + submit "이미지 추가"(useFormStatus). 성공 시 revalidate가 목록 갱신.
  - 기존 이미지 목록: 각 이미지 `<img src={url} className="h-24 w-24 object-cover rounded" alt="" />` + "삭제" 버튼(useTransition → `deleteBoardImage(img.id, postId)` → `router.refresh()`; confirm). 
  - 에러 표시. CSS 변수 스타일. (`<img>` 사용 라인에 필요 시 `{/* eslint-disable-next-line @next/next/no-img-element */}`.)

- [ ] **Step 2: 편집 페이지에 배치** — `edit/page.tsx`: 기존 폼 아래에 `<BoardImageManager postId={id} images={post.images.map(i => ({ id: i.id, url: i.url }))} />` 추가(post는 getBoardPost 결과, images 포함).

- [ ] **Step 3: 상세 이미지 표시** — `board/[id]/page.tsx`: 본문 아래(좋아요 위/아래 적당한 곳)에 `post.images`가 있으면 이미지들을 렌더:
  ```tsx
  {post.images.length > 0 && (
    <div className="mt-6 space-y-3">
      {post.images.map((im) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={im.id} src={im.url} alt="" className="w-full rounded-xl" />
      ))}
    </div>
  )}
  ```

- [ ] **Step 4: Verify** — `cd website && npx tsc --noEmit && npx eslint src/app/board && npm run build` → no errors; `/board/[id]`,`/board/[id]/edit` 빌드.
- [ ] **Step 5: Commit** — stage the 3 files; msg "게시판 편집 이미지 관리 + 상세 이미지 표시".

---

### Task 4: 빌드 + 마이그레이션 적용 + 배포

- [ ] **Step 1** — `cd website && npm run build && npm run lint` → 성공.
- [ ] **Step 2 (사용자 승인 후)** — `supabase migration list`로 `20260706030001`만 미적용 확인 → `supabase db push`.
- [ ] **Step 3 (적용 후 감사, CLI)** — `supabase db query --linked "SELECT (SELECT count(*) FROM pg_policies WHERE tablename='board_post_images') AS img_policies, (SELECT count(*) FROM storage.buckets WHERE id='board-images' AND public) AS bucket_public, (SELECT count(*) FROM pg_policies WHERE schemaname='storage' AND policyname LIKE 'board_images%') AS storage_policies;"` → 3 / 1 / 3.
- [ ] **Step 4: 수동 검증** — 본인 글 편집에서 이미지 업로드(여러 장)→상세 표시 / 이미지 삭제 / 비-jpg·5MB초과 거부 / 타인 글에 첨부 불가(RLS) / 비회원 업로드 불가.
- [ ] **Step 5** — main FF 머지 + push(사용자 승인).

## Self-Review
- Spec 4.4 커버: 공개버킷+테이블+RLS(T1), 업로드/삭제 액션(본인/기획단, MIME·용량·롤백)+상세 데이터(T2), 편집 업로드 UI+상세 표시(T3), 적용/검증(T4).
- Placeholder 없음. next/image 대신 `<img>` 사용 결정 명시(사용자 업로드 이미지). storage 삭제는 owner/editor 정책.
- Type consistency: `uploadBoardImage(postId,_prev,formData)`/`deleteBoardImage(imageId,postId)`(T2) → T3 소비. `BoardImage{id,url,sortOrder}`(T2) → 상세/편집 소비.
- 알려진 결정: 업로드는 편집 화면(글 존재 필요, meeting-attachments 패턴). 목록 썸네일·본문 인라인은 비범위. sort_order=현재 개수(간단).
