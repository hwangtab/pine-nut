"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { validateOptionalImageUrl } from "@/lib/validation/url";
import { uploadImageFromFormData } from "@/lib/storage/upload";
import { logAudit } from "./audit";
import type { ActionState } from "./news";

const TIMELINE_CATEGORIES = ["회의", "집회", "법률", "연대", "기타"];

interface ValidatedTimelineForm {
  date: string;
  year: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
}

interface TimelineAuditRow {
  id: number;
  date: string;
  year: number;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  image_alt: string | null;
  sort_order: number;
  is_deleted: boolean;
}

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function extractYearFromDate(dateText: string): number {
  // "2024년 3월", "2019년 여름", "2024.03.15" 등에서 4자리 연도 추출
  const match = dateText.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

function validateTimelineForm(formData: FormData): { data: ValidatedTimelineForm | null; error: string | null } {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const date = (formData.get("date") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const category = formData.get("category") as string;
  const sortOrderStr = formData.get("sort_order") as string;
  const imageAlt = (formData.get("image_alt") as string)?.trim() || null;

  if (!title) return { data: null, error: "제목을 입력해주세요." };
  if (title.length > 200) return { data: null, error: "제목은 200자 이내로 입력해주세요." };
  if (!description) return { data: null, error: "설명을 입력해주세요." };
  if (!date) return { data: null, error: "날짜를 입력해주세요." };
  if (!category || !TIMELINE_CATEGORIES.includes(category)) return { data: null, error: "분류를 선택해주세요." };

  // 연도: 직접 입력값 우선, 없으면 날짜 텍스트에서 자동 추출
  const parsedYear = parseInt(yearStr, 10);
  const year = (!isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100)
    ? parsedYear
    : extractYearFromDate(date);

  // 정렬 순서: 입력값 있으면 사용, 없으면 0 (create 시 서버에서 max+1 할당)
  const sortOrder = parseInt(sortOrderStr, 10) || 0;

  const imageUrlValidation = validateOptionalImageUrl(formData.get("image_url") as string, "사진 주소");
  if (imageUrlValidation.error) return { data: null, error: imageUrlValidation.error };

  return {
    data: {
      date,
      year,
      title,
      description,
      category,
      imageUrl: imageUrlValidation.value,
      imageAlt,
      sortOrder,
    },
    error: null,
  };
}

function friendlyError(message: string): string {
  if (message.includes("duplicate key")) {
    return "중복된 데이터가 있습니다. 내용을 확인해주세요.";
  }
  return "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
}

function revalidateTimelinePaths() {
  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  revalidatePath("/admin/history");
}

async function getTimelineAuditRow(
  supabase: Awaited<ReturnType<typeof getAuthenticatedClient>>,
  id: number,
): Promise<TimelineAuditRow | null> {
  const { data } = await supabase
    .from("timeline_events")
    .select(
      "id, date, year, title, description, category, image_url, image_alt, sort_order, is_deleted",
    )
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

function parseTimelineAuditRow(
  payload: Record<string, unknown> | null | undefined,
): TimelineAuditRow | null {
  const raw = payload?.before;
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  return {
    id: typeof row.id === "number" ? row.id : 0,
    date: typeof row.date === "string" ? row.date : "",
    year: typeof row.year === "number" ? row.year : 0,
    title: typeof row.title === "string" ? row.title : "",
    description: typeof row.description === "string" ? row.description : "",
    category: typeof row.category === "string" ? row.category : "",
    image_url: typeof row.image_url === "string" ? row.image_url : null,
    image_alt: typeof row.image_alt === "string" ? row.image_alt : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_deleted: row.is_deleted === true,
  };
}

export async function createTimelineAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: validatedForm, error: validationError } = validateTimelineForm(formData);
  if (validationError || !validatedForm) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedClient();

  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(supabase, imageFile, "timeline");
  if (uploadResult.error) return { error: uploadResult.error };

  const imageUrl = uploadResult.url ?? validatedForm.imageUrl;

  // 정렬 순서가 0이면 현재 최대값+1로 자동 할당 (맨 아래에 추가)
  let sortOrder = validatedForm.sortOrder;
  if (sortOrder === 0) {
    const { data: maxRow } = await supabase
      .from("timeline_events")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();
    sortOrder = (maxRow?.sort_order ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from("timeline_events")
    .insert({
      date: validatedForm.date,
      year: validatedForm.year,
      title: validatedForm.title,
      description: validatedForm.description,
      category: validatedForm.category,
      image_url: imageUrl,
      image_alt: validatedForm.imageAlt,
      sort_order: sortOrder,
    })
    .select(
      "id, date, year, title, description, category, image_url, image_alt, sort_order, is_deleted",
    )
    .single();

  if (error) return { error: friendlyError(error.message) };
  if (data) {
    await logAudit(supabase, "timeline_events", data.id, "create", {
      entityKey: data.title,
      payload: {
        after: data,
      },
    });
  }

  revalidateTimelinePaths();
  redirect("/admin/timeline");
}

export async function updateTimelineAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: validatedForm, error: validationError } = validateTimelineForm(formData);
  if (validationError || !validatedForm) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedClient();

  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(supabase, imageFile, "timeline");
  if (uploadResult.error) return { error: uploadResult.error };

  const imageUrl = uploadResult.url ?? validatedForm.imageUrl;

  const beforeRow = await getTimelineAuditRow(supabase, id);

  const { data: afterRow, error } = await supabase
    .from("timeline_events")
    .update({
      date: validatedForm.date,
      year: validatedForm.year,
      title: validatedForm.title,
      description: validatedForm.description,
      category: validatedForm.category,
      image_url: imageUrl,
      image_alt: validatedForm.imageAlt,
      sort_order: validatedForm.sortOrder,
    })
    .eq("id", id)
    .select(
      "id, date, year, title, description, category, image_url, image_alt, sort_order, is_deleted",
    )
    .single();

  if (error) return { error: friendlyError(error.message) };
  await logAudit(supabase, "timeline_events", id, "update", {
    entityKey: afterRow?.title ?? beforeRow?.title ?? undefined,
    payload: {
      before: beforeRow,
      after: afterRow,
    },
  });

  revalidateTimelinePaths();
  redirect("/admin/timeline");
}

export async function deleteTimelineAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const beforeRow = await getTimelineAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("timeline_events")
      .update({ is_deleted: true })
      .eq("id", id)
      .select(
        "id, date, year, title, description, category, image_url, image_alt, sort_order, is_deleted",
      )
      .single();
    if (error) return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "timeline_events", id, "delete", {
      entityKey: beforeRow?.title ?? afterRow?.title ?? undefined,
      payload: {
        before: beforeRow,
        after: afterRow,
      },
    });
    revalidateTimelinePaths();
    return null;
  } catch {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreTimelineAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedClient();
    const beforeRow = await getTimelineAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("timeline_events")
      .update({ is_deleted: false })
      .eq("id", id)
      .select(
        "id, date, year, title, description, category, image_url, image_alt, sort_order, is_deleted",
      )
      .single();
    if (error) return { error: "복원에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "timeline_events", id, "restore", {
      entityKey: afterRow?.title ?? beforeRow?.title ?? undefined,
      payload: {
        before: beforeRow,
        after: afterRow,
      },
    });
    revalidateTimelinePaths();
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreTimelineVersionAction(
  payload: Record<string, unknown> | null | undefined,
): Promise<ActionState> {
  const row = parseTimelineAuditRow(payload);
  if (!row || !row.id || !row.title || !row.date || !row.year || !row.category) {
    return { error: "복원 가능한 타임라인 데이터가 없습니다." };
  }

  try {
    const supabase = await getAuthenticatedClient();
    const currentRow = await getTimelineAuditRow(supabase, row.id);
    const { error } = await supabase.from("timeline_events").upsert(
      {
        id: row.id,
        date: row.date,
        year: row.year,
        title: row.title,
        description: row.description,
        category: row.category,
        image_url: row.image_url,
        image_alt: row.image_alt,
        sort_order: row.sort_order,
        is_deleted: row.is_deleted,
      },
      { onConflict: "id" },
    );

    if (error) {
      return { error: friendlyError(error.message) };
    }

    await logAudit(supabase, "timeline_events", row.id, "restore", {
      entityKey: row.title,
      payload: {
        before: currentRow,
        after: row,
      },
    });

    revalidateTimelinePaths();
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
