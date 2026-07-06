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
export interface BoardPostDetail {
  id: number; authorUserId: string; authorNickname: string; title: string; content: string; category: string;
  createdAt: string; updatedAt: string; isHidden: boolean; isDeleted: boolean; comments: BoardComment[];
  likeCount: number;
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
): Promise<{ items: BoardPostListItem[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { items: [], total: 0 };
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("board_posts")
    .select("id, title, category, author_nickname, created_at, is_hidden, is_deleted, like_count, board_comments(count)", { count: "exact" })
    .order("created_at", { ascending: false });

  const category = opts.category;
  if (category && (BOARD_CATEGORIES as readonly string[]).includes(category)) {
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
      likeCount: r.like_count ?? 0,
    })),
    total: count ?? 0,
  };
}

export async function getBoardPost(id: number): Promise<BoardPostDetail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, author_user_id, author_nickname, title, content, category, created_at, updated_at, is_hidden, is_deleted, like_count, board_comments(id, author_user_id, author_nickname, content, created_at, is_hidden, is_deleted)")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("getBoardPost", error); return null; }
  if (!data) return null;
  const p = data as Omit<PostRow, "board_comments"> & { board_comments: CommentRow[] };
  return {
    id: p.id, authorUserId: p.author_user_id, authorNickname: p.author_nickname, title: p.title, content: p.content,
    category: p.category, createdAt: p.created_at, updatedAt: p.updated_at, isHidden: p.is_hidden, isDeleted: p.is_deleted,
    comments: (p.board_comments ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => ({ id: c.id, authorUserId: c.author_user_id, authorNickname: c.author_nickname, content: c.content, createdAt: c.created_at, isHidden: c.is_hidden, isDeleted: c.is_deleted })),
    likeCount: p.like_count ?? 0,
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
