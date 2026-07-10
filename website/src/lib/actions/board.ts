"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember, requireEditor } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";
import { BOARD_CATEGORIES, type BoardCategory } from "@/lib/board-categories";

function parseCategory(formData: FormData): BoardCategory {
  const raw = (formData.get("category") as string | null)?.trim() ?? "";
  return (BOARD_CATEGORIES as readonly string[]).includes(raw) ? (raw as BoardCategory) : "자유";
}

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
    .insert({ author_user_id: gate.user.id, author_nickname: gate.nickname, title: parsed.title, content: parsed.content, category: parseCategory(formData) })
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
    .from("board_posts").update({ title: parsed.title, content: parsed.content, category: parseCategory(formData) })
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
  // 행 삭제(RLS: 작성자/기획단). 0행이면 권한 없음 → 거짓 성공 방지.
  const { data: deleted, error: delErr } = await gate.supabase
    .from("board_post_images").delete().eq("id", imageId).select("id").maybeSingle();
  if (delErr) return { error: "삭제에 실패했습니다." };
  if (!deleted) return { error: "본인 이미지만 삭제할 수 있습니다." };
  const { error: stErr } = await gate.supabase.storage.from(BOARD_IMAGE_BUCKET).remove([row.storage_path]);
  if (stErr) console.error("board image storage remove:", stErr);
  revalidatePath(`/board/${postId}`);
  revalidatePath(`/board/${postId}/edit`);
  return null;
}

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
    // UNIQUE 위반(동시요청, 23505)은 이미 눌린 상태이므로 무시
    if (error && error.code !== "23505") return { error: "처리에 실패했습니다." };
  }
  revalidatePath("/board");
  revalidatePath(`/board/${postId}`);
  return null;
}
