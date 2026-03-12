"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { validateOptionalImageUrl, validateOptionalSourceUrl } from "@/lib/validation/url";
import { fetchOgImage } from "@/lib/og-image";
import { uploadImageFromFormData } from "@/lib/storage/upload";
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

interface NewsAuditRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  source_url: string;
  source_name: string;
  thumbnail_url: string | null;
  is_deleted: boolean;
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

function revalidateNewsPaths(...slugs: Array<string | null | undefined>) {
  revalidatePath("/news");
  [...new Set(slugs.filter((slug): slug is string => !!slug))].forEach((slug) => {
    revalidatePath(`/news/${slug}`);
  });
  revalidatePath("/admin/news");
  revalidatePath("/admin/history");
}

async function getNewsAuditRow(
  supabase: Awaited<ReturnType<typeof getAuthenticatedClient>>,
  id: number,
): Promise<NewsAuditRow | null> {
  const { data } = await supabase
    .from("news")
    .select(
      "id, slug, title, summary, content, date, category, source_url, source_name, thumbnail_url, is_deleted",
    )
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

function parseNewsAuditRow(
  payload: Record<string, unknown> | null | undefined,
): NewsAuditRow | null {
  const raw = payload?.before;
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  return {
    id: typeof row.id === "number" ? row.id : 0,
    slug: typeof row.slug === "string" ? row.slug : "",
    title: typeof row.title === "string" ? row.title : "",
    summary: typeof row.summary === "string" ? row.summary : "",
    content: typeof row.content === "string" ? row.content : "",
    date: typeof row.date === "string" ? row.date : "",
    category: typeof row.category === "string" ? row.category : "",
    source_url: typeof row.source_url === "string" ? row.source_url : "",
    source_name: typeof row.source_name === "string" ? row.source_name : "",
    thumbnail_url:
      typeof row.thumbnail_url === "string" ? row.thumbnail_url : null,
    is_deleted: row.is_deleted === true,
  };
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

  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(supabase, imageFile, "news");
  if (uploadResult.error) return { error: uploadResult.error };

  const thumbnailUrl = uploadResult.url
    ?? await resolveThumbnailUrl(validatedForm.thumbnailUrl, validatedForm.sourceUrl);

  const { data, error } = await supabase
    .from("news")
    .insert({
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
    .select(
      "id, slug, title, summary, content, date, category, source_url, source_name, thumbnail_url, is_deleted",
    )
    .single();

  if (error) return { error: friendlyError(error.message) };
  if (data) {
    await logAudit(supabase, "news", data.id, "create", {
      entityKey: data.slug,
      payload: {
        after: data,
      },
    });
  }

  revalidateNewsPaths(data?.slug);
  redirect("/admin/news");
}

export async function updateNewsAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: validatedForm, error: validationError } = validateNewsForm(formData);
  if (validationError || !validatedForm) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedClient();

  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(supabase, imageFile, "news");
  if (uploadResult.error) return { error: uploadResult.error };

  const thumbnailUrl = uploadResult.url
    ?? await resolveThumbnailUrl(validatedForm.thumbnailUrl, validatedForm.sourceUrl);

  const beforeRow = await getNewsAuditRow(supabase, id);

  const { data: afterRow, error } = await supabase
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
    .eq("id", id)
    .select(
      "id, slug, title, summary, content, date, category, source_url, source_name, thumbnail_url, is_deleted",
    )
    .single();

  if (error) return { error: friendlyError(error.message) };
  await logAudit(supabase, "news", id, "update", {
    entityKey: afterRow?.slug ?? beforeRow?.slug ?? undefined,
    payload: {
      before: beforeRow,
      after: afterRow,
    },
  });

  revalidateNewsPaths(beforeRow?.slug, afterRow?.slug);
  redirect("/admin/news");
}

export async function deleteNewsAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const beforeRow = await getNewsAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("news")
      .update({ is_deleted: true })
      .eq("id", id)
      .select(
        "id, slug, title, summary, content, date, category, source_url, source_name, thumbnail_url, is_deleted",
      )
      .single();
    if (error) return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "news", id, "delete", {
      entityKey: beforeRow?.slug ?? afterRow?.slug ?? undefined,
      payload: {
        before: beforeRow,
        after: afterRow,
      },
    });
    revalidateNewsPaths(beforeRow?.slug, afterRow?.slug);
    return null;
  } catch {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreNewsAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const beforeRow = await getNewsAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("news")
      .update({ is_deleted: false })
      .eq("id", id)
      .select(
        "id, slug, title, summary, content, date, category, source_url, source_name, thumbnail_url, is_deleted",
      )
      .single();
    if (error) return { error: "복원에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "news", id, "restore", {
      entityKey: afterRow?.slug ?? beforeRow?.slug ?? undefined,
      payload: {
        before: beforeRow,
        after: afterRow,
      },
    });
    revalidateNewsPaths(beforeRow?.slug, afterRow?.slug);
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreNewsVersionAction(
  payload: Record<string, unknown> | null | undefined,
): Promise<ActionState> {
  const row = parseNewsAuditRow(payload);
  if (!row || !row.id || !row.slug || !row.title || !row.date || !row.category) {
    return { error: "복원 가능한 소식 데이터가 없습니다." };
  }

  try {
    const supabase = await getAuthenticatedClient();
    const currentRow = await getNewsAuditRow(supabase, row.id);
    const { error } = await supabase.from("news").upsert(
      {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        content: row.content,
        date: row.date,
        category: row.category,
        source_url: row.source_url,
        source_name: row.source_name,
        thumbnail_url: row.thumbnail_url,
        is_deleted: row.is_deleted,
      },
      { onConflict: "id" },
    );

    if (error) {
      return { error: friendlyError(error.message) };
    }

    await logAudit(supabase, "news", row.id, "restore", {
      entityKey: row.slug,
      payload: {
        before: currentRow,
        after: row,
      },
    });

    revalidateNewsPaths(row.slug);
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
