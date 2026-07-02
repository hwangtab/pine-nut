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
