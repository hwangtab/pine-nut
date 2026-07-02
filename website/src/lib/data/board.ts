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
  const p = data as Omit<PostRow, "board_comments"> & { board_comments: CommentRow[] };
  return {
    id: p.id, authorUserId: p.author_user_id, authorNickname: p.author_nickname, title: p.title, content: p.content,
    createdAt: p.created_at, updatedAt: p.updated_at, isHidden: p.is_hidden, isDeleted: p.is_deleted,
    comments: (p.board_comments ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => ({ id: c.id, authorUserId: c.author_user_id, authorNickname: c.author_nickname, content: c.content, createdAt: c.created_at, isHidden: c.is_hidden, isDeleted: c.is_deleted })),
  };
}
