import { redirect } from "next/navigation";
import { logAudit } from "@/lib/actions/audit";
import { getAuthenticatedActionClient } from "@/lib/actions/auth";
import {
  getNewsAuditRow,
  NEWS_AUDIT_SELECT,
  parseNewsAuditRow,
} from "@/lib/actions/news/audit-row";
import {
  friendlyNewsError,
  resolveThumbnailUrl,
  validateNewsForm,
} from "@/lib/actions/news/form";
import { revalidateNewsPaths } from "@/lib/actions/news/revalidation";
import type { ActionState } from "@/lib/actions/state";
import { uploadImageFromFormData } from "@/lib/storage/upload";

export async function createNews(formData: FormData): Promise<ActionState> {
  const { data: validatedForm, error: validationError } =
    validateNewsForm(formData);
  if (validationError || !validatedForm) {
    return { error: validationError ?? "입력값이 올바르지 않습니다." };
  }

  const supabase = await getAuthenticatedActionClient();
  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(supabase, imageFile, "news");
  if (uploadResult.error) return { error: uploadResult.error };

  const thumbnailUrl =
    uploadResult.url ??
    (await resolveThumbnailUrl(
      validatedForm.thumbnailUrl,
      validatedForm.sourceUrl,
    ));

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
    .select(NEWS_AUDIT_SELECT)
    .single();

  if (error) return { error: friendlyNewsError(error.message) };
  if (data) {
    await logAudit(supabase, "news", data.id, "create", {
      entityKey: data.slug,
      payload: { after: data },
    });
  }

  revalidateNewsPaths(data?.slug);
  redirect("/admin/news");
}

export async function updateNews(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  const { data: validatedForm, error: validationError } =
    validateNewsForm(formData);
  if (validationError || !validatedForm) {
    return { error: validationError ?? "입력값이 올바르지 않습니다." };
  }

  const supabase = await getAuthenticatedActionClient();
  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(supabase, imageFile, "news");
  if (uploadResult.error) return { error: uploadResult.error };

  const thumbnailUrl =
    uploadResult.url ??
    (await resolveThumbnailUrl(
      validatedForm.thumbnailUrl,
      validatedForm.sourceUrl,
    ));
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
    .select(NEWS_AUDIT_SELECT)
    .single();

  if (error) return { error: friendlyNewsError(error.message) };
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

export async function deleteNews(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedActionClient();
    const beforeRow = await getNewsAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("news")
      .update({ is_deleted: true })
      .eq("id", id)
      .select(NEWS_AUDIT_SELECT)
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

export async function restoreNews(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedActionClient();
    const beforeRow = await getNewsAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("news")
      .update({ is_deleted: false })
      .eq("id", id)
      .select(NEWS_AUDIT_SELECT)
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

export async function restoreNewsVersion(
  payload: Record<string, unknown> | null | undefined,
): Promise<ActionState> {
  const row = parseNewsAuditRow(payload);
  if (!row || !row.id || !row.slug || !row.title || !row.date || !row.category) {
    return { error: "복원 가능한 소식 데이터가 없습니다." };
  }

  try {
    const supabase = await getAuthenticatedActionClient();
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
      return { error: friendlyNewsError(error.message) };
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
