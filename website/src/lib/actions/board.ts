"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember, requireEditor } from "./auth";
import { logAudit } from "./audit";
import { formValues, type ActionState } from "./state";
import { BOARD_CATEGORIES, type BoardCategory } from "@/lib/board-categories";
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXT_BY_TYPE,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  sniffImageType,
} from "@/lib/image-upload-limits";
import {
  BOARD_COMMENT_MAX,
  BOARD_POST_CONTENT_MAX,
  BOARD_POST_TITLE_MAX,
} from "@/components/board/board-limits";

// 실패 시 제출값을 함께 돌려준다. React 19가 폼을 자동 리셋해도 폼이 이 값으로
// 다시 그려지므로 작성 중이던 글이 사라지지 않는다.
function withValues(state: ActionState, formData: FormData): ActionState {
  return state?.error ? { ...state, values: formValues(formData) } : state;
}

// DB 트리거(board_rate_limit)가 작성 속도 제한에 걸리면 이 메시지로 예외를 낸다.
function isRateLimited(error: { message?: string } | null): boolean {
  return !!error?.message?.includes("board_rate_limited");
}

function parseCategory(formData: FormData): BoardCategory {
  const raw = (formData.get("category") as string | null)?.trim() ?? "";
  return (BOARD_CATEGORIES as readonly string[]).includes(raw) ? (raw as BoardCategory) : "자유";
}

function parseTitleContent(formData: FormData): { title: string; content: string } | { error: string } {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  if (!title || title.length > BOARD_POST_TITLE_MAX) {
    return { error: `제목을 1~${BOARD_POST_TITLE_MAX}자로 입력해주세요.` };
  }
  if (!content) return { error: "내용을 입력해주세요." };
  // 댓글에는 2000자 상한이 있는데 본문에는 어디에도 없었다. 초장문 하나로
  // 목록·상세 렌더와 감사 로그 payload가 함께 무거워진다.
  if (content.length > BOARD_POST_CONTENT_MAX) {
    return { error: `내용은 ${BOARD_POST_CONTENT_MAX.toLocaleString()}자 이내로 입력해주세요.` };
  }
  return { title, content };
}

export async function createBoardPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fail = (error: string) => withValues({ error }, formData);
  const parsed = parseTitleContent(formData);
  if ("error" in parsed) return fail(parsed.error);
  const gate = await requireMember();
  if ("error" in gate) return fail(gate.error);
  if (!gate.nickname) return fail("닉네임을 먼저 설정해주세요. (마이페이지)");
  const { data, error } = await gate.supabase
    .from("board_posts")
    .insert({ author_user_id: gate.user.id, author_nickname: gate.nickname, title: parsed.title, content: parsed.content, category: parseCategory(formData) })
    .select("id").single();
  if (isRateLimited(error)) return fail("짧은 시간에 글을 너무 많이 썼습니다. 잠시 후 다시 시도해주세요.");
  if (error || !data) return fail("글 작성에 실패했습니다.");
  await logAudit(gate.supabase, "board_posts", data.id, "create", { entityKey: parsed.title });
  revalidatePath("/board");
  redirect(`/board/${data.id}`);
}

export async function updateBoardPost(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const fail = (error: string) => withValues({ error }, formData);
  const parsed = parseTitleContent(formData);
  if ("error" in parsed) return fail(parsed.error);
  const gate = await requireMember();
  if ("error" in gate) return fail(gate.error);
  // 본인 글만: RLS(owner_update)로 강제되며, 앱에서도 author 확인
  const { data, error } = await gate.supabase
    .from("board_posts").update({ title: parsed.title, content: parsed.content, category: parseCategory(formData) })
    .eq("id", id).eq("author_user_id", gate.user.id).select("id").single();
  if (error || !data) return fail("수정에 실패했습니다. (본인 글만 수정 가능)");
  await logAudit(gate.supabase, "board_posts", id, "update", { entityKey: parsed.title });
  revalidatePath("/board"); revalidatePath(`/board/${id}`);
  redirect(`/board/${id}`);
}

export async function deleteBoardPost(id: number): Promise<ActionState> {
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  // update().select()로 지우면 갱신된 행이 SELECT 정책(public_read: NOT is_deleted)에
  // 걸러져 일반 회원은 언제나 실패했다. 작성자 확인까지 SECURITY DEFINER RPC에서 한다.
  const { data, error } = await gate.supabase.rpc("soft_delete_my_board_post", { p_id: id });
  if (error) {
    console.error("deleteBoardPost: rpc failed", error.message);
    return { error: "삭제에 실패했습니다." };
  }
  if (data !== true) return { error: "삭제에 실패했습니다. (본인 글만)" };
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
  const fail = (error: string) => withValues({ error }, formData);
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  if (!content) return fail("댓글 내용을 입력해주세요.");
  if (content.length > BOARD_COMMENT_MAX) return fail(`댓글은 ${BOARD_COMMENT_MAX}자 이하로 입력해주세요.`);
  const gate = await requireMember();
  if ("error" in gate) return fail(gate.error);
  if (!gate.nickname) return fail("닉네임을 먼저 설정해주세요. (마이페이지)");
  const { data, error } = await gate.supabase
    .from("board_comments")
    .insert({ post_id: postId, author_user_id: gate.user.id, author_nickname: gate.nickname, content })
    .select("id").single();
  if (isRateLimited(error)) return fail("짧은 시간에 댓글을 너무 많이 썼습니다. 잠시 후 다시 시도해주세요.");
  if (error || !data) return fail("댓글 작성에 실패했습니다.");
  await logAudit(gate.supabase, "board_comments", data.id, "create", {});
  revalidatePath(`/board/${postId}`);
  return null;
}

export async function deleteBoardComment(id: number, postId: number): Promise<ActionState> {
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  // 글 삭제와 같은 이유로 RPC를 쓴다(soft_delete_my_board_post 주석 참고).
  const { data, error } = await gate.supabase.rpc("soft_delete_my_board_comment", { p_id: id });
  if (error) {
    console.error("deleteBoardComment: rpc failed", error.message);
    return { error: "삭제에 실패했습니다." };
  }
  if (data !== true) return { error: "삭제에 실패했습니다. (본인 댓글만)" };
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

export async function uploadBoardImage(postId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get("image_file");
  if (!(file instanceof File) || file.size === 0) return { error: "이미지를 선택해주세요." };
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { error: "JPG, PNG, WebP 형식만 올릴 수 있습니다." };
  }
  if (file.size > MAX_IMAGE_BYTES) return { error: `이미지는 ${MAX_IMAGE_MB}MB 이하만 가능합니다.` };
  // 선언된 MIME(file.type)은 확장자 기반이라 믿을 수 없다. 실제 바이트로 형식을 판정하고,
  // 확장자·contentType도 판정 결과로 정한다.
  const sniffed = await sniffImageType(file);
  if (!sniffed) return { error: "JPG, PNG, WebP 형식만 올릴 수 있습니다." };
  const ext = IMAGE_EXT_BY_TYPE[sniffed];
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };

  const path = `${postId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await gate.supabase.storage.from(BOARD_IMAGE_BUCKET)
    .upload(path, file, { contentType: sniffed, upsert: false });
  if (upErr) return { error: "이미지 업로드에 실패했습니다." };

  // 정렬 순서: 현재 최대값 + 1.
  // '개수'로 매기면 중간 이미지를 지운 뒤 새로 올릴 때 기존 값과 겹쳐 순서가 뒤섞인다.
  const { data: maxRow } = await gate.supabase
    .from("board_post_images")
    .select("sort_order")
    .eq("post_id", postId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? -1) + 1;
  const { error: insErr } = await gate.supabase.from("board_post_images")
    .insert({ post_id: postId, storage_path: path, sort_order: nextOrder });
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

const REPORT_ERRORS: Record<string, string> = {
  forbidden: "회원만 신고할 수 있습니다.",
  invalid_target: "잘못된 신고 대상입니다.",
  invalid_reason: "신고 사유를 선택해주세요.",
  not_found: "신고 대상을 찾을 수 없습니다.",
  rate_limited: "하루 신고 가능 횟수를 초과했습니다. 내일 다시 시도해주세요.",
  duplicate: "이미 신고하셨습니다.",
};

export async function reportTarget(targetType: "post" | "comment", targetId: number, reason: string): Promise<ActionState> {
  if (!REPORT_REASONS.includes(reason)) return { error: "신고 사유를 선택해주세요." };
  if (!Number.isInteger(targetId) || targetId <= 0) return { error: "잘못된 신고 대상입니다." };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };

  // 대상 확인·건수 제한·삽입을 SECURITY DEFINER 함수 하나로 처리한다.
  // 앱에서 board_reports를 count하면 SELECT 정책(admin_can_edit)에 걸려 일반 회원은
  // 언제나 0이 나오고, 제한이 정확히 반대로(editor에게만) 걸린다.
  const { data, error } = await gate.supabase.rpc("report_board_target", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
  });

  if (error) {
    console.error("reportTarget: rpc failed", error.message);
    return { error: "신고에 실패했습니다." };
  }
  if (data !== "ok") {
    return { error: REPORT_ERRORS[data as string] ?? "신고에 실패했습니다." };
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
