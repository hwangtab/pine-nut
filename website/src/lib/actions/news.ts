"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { validateOptionalImageUrl, validateOptionalSourceUrl } from "@/lib/validation/url";
import { fetchOgImage } from "@/lib/og-image";
import { logAudit } from "./audit";

export type ActionState = { error: string } | null;

const NEWS_CATEGORIES = ["공지", "집회", "언론보도", "연대"];

interface ValidatedNewsForm {
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  sourceUrl: string;
  sourceName: string;
  thumbnailUrl: string | null;
}

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function generateSlug(date: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  return `news-${date}-${random}`;
}

function validateNewsForm(formData: FormData): { data: ValidatedNewsForm | null; error: string | null } {
  const rawSlug = (formData.get("slug") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const date = formData.get("date") as string;
  const category = formData.get("category") as string;
  const sourceName = (formData.get("source_name") as string)?.trim() || "";

  if (!title) return { data: null, error: "제목을 입력해주세요." };
  if (title.length > 200) return { data: null, error: "제목은 200자 이내로 입력해주세요." };
  if (!summary) return { data: null, error: "요약을 입력해주세요." };
  if (!content) return { data: null, error: "본문을 입력해주세요." };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { data: null, error: "올바른 날짜를 선택해주세요." };
  if (!category || !NEWS_CATEGORIES.includes(category)) return { data: null, error: "분류를 선택해주세요." };

  // 슬러그: 입력값 있으면 사용, 없으면 날짜+랜덤으로 자동 생성
  const slug = rawSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug) ? rawSlug : generateSlug(date);

  const sourceUrlValidation = validateOptionalSourceUrl(formData.get("source_url") as string);
  if (sourceUrlValidation.error) return { data: null, error: sourceUrlValidation.error };

  const thumbnailUrlValidation = validateOptionalImageUrl(formData.get("thumbnail_url") as string, "썸네일 이미지 URL");
  if (thumbnailUrlValidation.error) return { data: null, error: thumbnailUrlValidation.error };

  return {
    data: {
      slug,
      title,
      summary,
      content,
      date,
      category,
      sourceUrl: sourceUrlValidation.value ?? "",
      sourceName,
      thumbnailUrl: thumbnailUrlValidation.value,
    },
    error: null,
  };
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

async function resolveThumbnailUrl(thumbnailUrl: string | null, sourceUrl: string): Promise<string | null> {
  if (thumbnailUrl || !sourceUrl) {
    return thumbnailUrl;
  }

  const fetchedOgImage = await fetchOgImage(sourceUrl);
  if (!fetchedOgImage) {
    return null;
  }

  const ogImageValidation = validateOptionalImageUrl(fetchedOgImage, "OG 이미지 URL");
  if (ogImageValidation.error) {
    return null;
  }

  return ogImageValidation.value;
}

export async function createNewsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: validatedForm, error: validationError } = validateNewsForm(formData);
  if (validationError || !validatedForm) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedClient();

  const thumbnailUrl = await resolveThumbnailUrl(validatedForm.thumbnailUrl, validatedForm.sourceUrl);

  const { data, error } = await supabase.from("news").insert({
    slug: validatedForm.slug,
    title: validatedForm.title,
    summary: validatedForm.summary,
    content: validatedForm.content,
    date: validatedForm.date,
    category: validatedForm.category,
    source_url: validatedForm.sourceUrl,
    source_name: validatedForm.sourceName,
    thumbnail_url: thumbnailUrl,
  }).select("id").single();

  if (error) return { error: friendlyError(error.message) };
  if (data) await logAudit(supabase, "news", data.id, "create");

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function updateNewsAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: validatedForm, error: validationError } = validateNewsForm(formData);
  if (validationError || !validatedForm) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedClient();

  const thumbnailUrl = await resolveThumbnailUrl(validatedForm.thumbnailUrl, validatedForm.sourceUrl);

  const { error } = await supabase
    .from("news")
    .update({
      slug: validatedForm.slug,
      title: validatedForm.title,
      summary: validatedForm.summary,
      content: validatedForm.content,
      date: validatedForm.date,
      category: validatedForm.category,
      source_url: validatedForm.sourceUrl,
      source_name: validatedForm.sourceName,
      thumbnail_url: thumbnailUrl,
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
