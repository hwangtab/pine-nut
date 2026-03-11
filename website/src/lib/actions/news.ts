"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "./audit";

export type ActionState = { error: string } | null;

const NEWS_CATEGORIES = ["공지", "집회", "언론보도", "연대"];

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function validateNewsForm(formData: FormData): string | null {
  const slug = (formData.get("slug") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const date = formData.get("date") as string;
  const category = formData.get("category") as string;

  if (!title) return "제목을 입력해주세요.";
  if (title.length > 200) return "제목은 200자 이내로 입력해주세요.";
  if (!slug) return "슬러그를 입력해주세요.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "슬러그는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.";
  if (!summary) return "요약을 입력해주세요.";
  if (!content) return "본문을 입력해주세요.";
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "올바른 날짜를 선택해주세요.";
  if (!NEWS_CATEGORIES.includes(category)) return "올바른 카테고리를 선택해주세요.";

  return null;
}

function friendlyError(message: string): string {
  if (message.includes("duplicate key") && message.includes("slug")) {
    return "이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해주세요.";
  }
  if (message.includes("duplicate key")) {
    return "중복된 데이터가 있습니다. 내용을 확인해주세요.";
  }
  return "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
}

export async function createNewsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const validationError = validateNewsForm(formData);
  if (validationError) return { error: validationError };

  const supabase = await getAuthenticatedClient();

  const { data, error } = await supabase.from("news").insert({
    slug: (formData.get("slug") as string).trim(),
    title: (formData.get("title") as string).trim(),
    summary: (formData.get("summary") as string).trim(),
    content: (formData.get("content") as string).trim(),
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    source_url: (formData.get("source_url") as string)?.trim() || "",
    source_name: (formData.get("source_name") as string)?.trim() || "",
    thumbnail_url: (formData.get("thumbnail_url") as string)?.trim() || null,
  }).select("id").single();

  if (error) return { error: friendlyError(error.message) };
  if (data) await logAudit(supabase, "news", data.id, "create");

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function updateNewsAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const validationError = validateNewsForm(formData);
  if (validationError) return { error: validationError };

  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("news")
    .update({
      slug: (formData.get("slug") as string).trim(),
      title: (formData.get("title") as string).trim(),
      summary: (formData.get("summary") as string).trim(),
      content: (formData.get("content") as string).trim(),
      date: formData.get("date") as string,
      category: formData.get("category") as string,
      source_url: (formData.get("source_url") as string)?.trim() || "",
      source_name: (formData.get("source_name") as string)?.trim() || "",
      thumbnail_url: (formData.get("thumbnail_url") as string)?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: friendlyError(error.message) };
  await logAudit(supabase, "news", id, "update");

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function deleteNewsAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const { error } = await supabase.from("news").update({ is_deleted: true }).eq("id", id);
    if (error) return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "news", id, "delete");
    revalidatePath("/news");
    revalidatePath("/admin/news");
    return null;
  } catch {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreNewsAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const { error } = await supabase.from("news").update({ is_deleted: false }).eq("id", id);
    if (error) return { error: "복원에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "news", id, "restore");
    revalidatePath("/news");
    revalidatePath("/admin/news");
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
