import { createSupabaseServerClient } from "@/lib/supabase-server";
import { BOARD_CATEGORIES } from "@/lib/board-categories";

export interface BoardPostListItem {
  id: number; title: string; category: string; authorNickname: string; createdAt: string; commentCount: number;
  isHidden: boolean; isDeleted: boolean; likeCount: number;
}
export interface BoardComment {
  id: number; authorUserId: string; authorNickname: string; content: string; createdAt: string;
  isHidden: boolean; isDeleted: boolean;
}
export interface BoardImage {
  id: number; url: string; sortOrder: number;
}
export interface BoardPostDetail {
  id: number; authorUserId: string; authorNickname: string; title: string; content: string; category: string;
  createdAt: string; updatedAt: string; isHidden: boolean; isDeleted: boolean; comments: BoardComment[];
  likeCount: number; images: BoardImage[];
}

interface PostRow {
  id: number; author_user_id: string; author_nickname: string; title: string; content: string; category: string;
  created_at: string; updated_at: string; is_hidden: boolean; is_deleted: boolean; like_count: number;
  board_comments?: { count: number }[];
}
interface CommentRow {
  id: number; author_user_id: string; author_nickname: string; content: string; created_at: string;
  is_hidden: boolean; is_deleted: boolean;
}

function sanitizeSearch(q: string): string {
  // PostgREST .or() 필터 예약문자 제거(인젝션 방지) 후 트림
  return q.replace(/[%_,()."*\\]/g, " ").replace(/\s+/g, " ").trim();
}

export async function getBoardPosts(
  page = 1,
  opts: { category?: string; q?: string } = {},
  perPage = 20,
): Promise<{ items: BoardPostListItem[]; total: number; failed: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { items: [], total: 0, failed: true };
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const category = opts.category;
  const validCategory = category && (BOARD_CATEGORIES as readonly string[]).includes(category) ? category : "";
  const q = sanitizeSearch(opts.q ?? "");

  // 목록 조회와 '범위 밖 페이지'일 때의 개수 조회가 같은 필터를 써야 해서 함수로 묶는다.
  function build(columns: string, head = false) {
    let query = supabase!
      .from("board_posts")
      .select(columns, { count: "exact", head })
      .order("created_at", { ascending: false });
    if (validCategory) query = query.eq("category", validCategory);
    if (q) {
      const pat = `%${q}%`;
      query = query.or(`title.ilike.${pat},content.ilike.${pat}`);
    }
    return query;
  }

  const { data, error, count } = await build(
    "id, title, category, author_nickname, created_at, is_hidden, is_deleted, like_count, board_comments(count)",
  ).range(from, to);

  if (error?.code === "PGRST103") {
    // ?page=N이 마지막 페이지를 넘으면 PostgREST가 416(PGRST103)을 돌려준다.
    // 이를 '글 없음'으로 삼키면 페이지 이동 버튼까지 사라지므로, 전체 개수만 다시 세어
    // 호출부가 마지막 페이지로 보낼 수 있게 한다.
    const { count: total, error: countErr } = await build("id", true);
    if (countErr) { console.error("getBoardPosts count", countErr); return { items: [], total: 0, failed: true }; }
    return { items: [], total: total ?? 0, failed: false };
  }
  // DB 오류를 빈 목록과 구분해 돌려준다. 같은 "글이 없습니다"로 보이면 장애를 알아챌 수 없다.
  if (error || !data) { console.error("getBoardPosts", error); return { items: [], total: 0, failed: true }; }
  return {
    items: (data as unknown as PostRow[]).map((r) => ({
      id: r.id, title: r.title, category: r.category, authorNickname: r.author_nickname, createdAt: r.created_at,
      commentCount: r.board_comments?.[0]?.count ?? 0, isHidden: r.is_hidden, isDeleted: r.is_deleted,
      likeCount: r.like_count ?? 0,
    })),
    total: count ?? 0,
    failed: false,
  };
}

export async function getBoardPost(id: number): Promise<BoardPostDetail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, author_user_id, author_nickname, title, content, category, created_at, updated_at, is_hidden, is_deleted, like_count, board_comments(id, author_user_id, author_nickname, content, created_at, is_hidden, is_deleted), board_post_images(id, storage_path, sort_order)")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("getBoardPost", error); return null; }
  if (!data) return null;
  const p = data as Omit<PostRow, "board_comments"> & { board_comments: CommentRow[] };
  const rawImages = ((p as unknown as { board_post_images?: { id: number; storage_path: string; sort_order: number }[] }).board_post_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order);
  // board-images는 private 버킷 → CDN 공개 URL 대신 만료 signed URL을 발급한다.
  // 숨김/삭제 글의 이미지는 storage RLS(부모 상태 필터)에 막혀 signed URL이 생성되지 않는다.
  let images: BoardImage[] = [];
  if (rawImages.length > 0) {
    const { data: signed, error: signErr } = await supabase.storage
      .from("board-images")
      .createSignedUrls(rawImages.map((im) => im.storage_path), 60 * 60);
    if (signErr) console.error("getBoardPost signed urls", id, signErr);
    images = rawImages
      .map((im, i) => ({ id: im.id, sortOrder: im.sort_order, url: signed?.[i]?.signedUrl ?? "" }))
      .filter((im) => im.url);
  }
  return {
    id: p.id, authorUserId: p.author_user_id, authorNickname: p.author_nickname, title: p.title, content: p.content,
    category: p.category, createdAt: p.created_at, updatedAt: p.updated_at, isHidden: p.is_hidden, isDeleted: p.is_deleted,
    comments: (p.board_comments ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => ({ id: c.id, authorUserId: c.author_user_id, authorNickname: c.author_nickname, content: c.content, createdAt: c.created_at, isHidden: c.is_hidden, isDeleted: c.is_deleted })),
    likeCount: p.like_count ?? 0,
    images,
  };
}

export async function hasLikedPost(postId: number): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("board_post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  return !!data;
}
