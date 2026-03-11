"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "./audit";
import type { ActionState } from "./news";

const TIMELINE_CATEGORIES = ["회의", "집회", "법률", "연대", "기타"];

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function validateTimelineForm(formData: FormData): string | null {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const date = (formData.get("date") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const category = formData.get("category") as string;
  const sortOrderStr = formData.get("sort_order") as string;

  if (!title) return "제목을 입력해주세요.";
  if (title.length > 200) return "제목은 200자 이내로 입력해주세요.";
  if (!description) return "설명을 입력해주세요.";
  if (!date) return "날짜 표시를 입력해주세요.";
  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < 2000 || year > 2100) return "연도를 올바르게 입력해주세요. (2000~2100)";
  if (!TIMELINE_CATEGORIES.includes(category)) return "올바른 카테고리를 선택해주세요.";
  if (sortOrderStr && isNaN(parseInt(sortOrderStr, 10))) return "정렬 순서는 숫자로 입력해주세요.";

  return null;
}

function friendlyError(message: string): string {
  if (message.includes("duplicate key")) {
    return "중복된 데이터가 있습니다. 내용을 확인해주세요.";
  }
  return "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
}

export async function createTimelineAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const validationError = validateTimelineForm(formData);
  if (validationError) return { error: validationError };

  const supabase = await getAuthenticatedClient();

  const { data, error } = await supabase.from("timeline_events").insert({
    date: (formData.get("date") as string).trim(),
    year: parseInt(formData.get("year") as string, 10),
    title: (formData.get("title") as string).trim(),
    description: (formData.get("description") as string).trim(),
    category: formData.get("category") as string,
    image_url: (formData.get("image_url") as string)?.trim() || null,
    image_alt: (formData.get("image_alt") as string)?.trim() || null,
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
  }).select("id").single();

  if (error) return { error: friendlyError(error.message) };
  if (data) await logAudit(supabase, "timeline_events", data.id, "create");

  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}

export async function updateTimelineAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const validationError = validateTimelineForm(formData);
  if (validationError) return { error: validationError };

  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("timeline_events")
    .update({
      date: (formData.get("date") as string).trim(),
      year: parseInt(formData.get("year") as string, 10),
      title: (formData.get("title") as string).trim(),
      description: (formData.get("description") as string).trim(),
      category: formData.get("category") as string,
      image_url: (formData.get("image_url") as string)?.trim() || null,
      image_alt: (formData.get("image_alt") as string)?.trim() || null,
      sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
    })
    .eq("id", id);

  if (error) return { error: friendlyError(error.message) };
  await logAudit(supabase, "timeline_events", id, "update");

  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}

export async function deleteTimelineAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const { error } = await supabase.from("timeline_events").update({ is_deleted: true }).eq("id", id);
    if (error) return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "timeline_events", id, "delete");
    revalidatePath("/timeline");
    revalidatePath("/admin/timeline");
    return null;
  } catch {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreTimelineAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const { error } = await supabase.from("timeline_events").update({ is_deleted: false }).eq("id", id);
    if (error) return { error: "복원에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "timeline_events", id, "restore");
    revalidatePath("/timeline");
    revalidatePath("/admin/timeline");
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
