import { redirect, unstable_rethrow } from "next/navigation";
import { logAudit } from "@/lib/actions/audit";
import { requireEditor } from "@/lib/actions/auth";
import type { AuthenticatedActionClient } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/state";
import {
  getTimelineAuditRow,
  parseTimelineAuditRow,
  TIMELINE_AUDIT_SELECT,
} from "@/lib/actions/timeline/audit-row";
import {
  friendlyTimelineError,
  validateTimelineForm,
} from "@/lib/actions/timeline/form";
import { revalidateTimelinePaths } from "@/lib/actions/timeline/revalidation";
import { removeUploadedImage, uploadImageFromFormData } from "@/lib/storage/upload";

async function resolveTimelineSortOrder(
  supabase: AuthenticatedActionClient,
  sortOrder: number,
): Promise<number> {
  if (sortOrder !== 0) return sortOrder;

  const { data: maxRow } = await supabase
    .from("timeline_events")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (maxRow?.sort_order ?? 0) + 1;
}

export async function createTimeline(formData: FormData): Promise<ActionState> {
  const { data: validatedForm, error: validationError } =
    validateTimelineForm(formData);
  if (validationError || !validatedForm) {
    return { error: validationError ?? "입력값이 올바르지 않습니다." };
  }

  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(
    supabase,
    imageFile,
    "timeline",
  );
  if (uploadResult.error) return { error: uploadResult.error };

  const imageUrl = uploadResult.url ?? validatedForm.imageUrl;
  const sortOrder = await resolveTimelineSortOrder(
    supabase,
    validatedForm.sortOrder,
  );

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
    .select(TIMELINE_AUDIT_SELECT)
    .single();

  if (error) {
    // 업로드는 됐는데 행 저장이 실패하면 참조되지 않는 파일만 남는다. 되돌린다.
    await removeUploadedImage(supabase, uploadResult.path);
    return { error: friendlyTimelineError(error.message) };
  }
  if (data) {
    await logAudit(supabase, "timeline_events", data.id, "create", {
      entityKey: data.title,
      payload: { after: data },
    });
  }

  revalidateTimelinePaths();
  redirect("/admin/timeline");
}

export async function updateTimeline(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  const { data: validatedForm, error: validationError } =
    validateTimelineForm(formData);
  if (validationError || !validatedForm) {
    return { error: validationError ?? "입력값이 올바르지 않습니다." };
  }

  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  const imageFile = formData.get("image_file") as File | null;
  const uploadResult = await uploadImageFromFormData(
    supabase,
    imageFile,
    "timeline",
  );
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
    .select(TIMELINE_AUDIT_SELECT)
    .single();

  if (error) {
    await removeUploadedImage(supabase, uploadResult.path);
    return { error: friendlyTimelineError(error.message) };
  }
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

export async function deleteTimeline(id: number): Promise<ActionState> {
  try {
    const gate = await requireEditor();
    if ("error" in gate) return { error: gate.error };
    const supabase = gate.supabase;
    const beforeRow = await getTimelineAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("timeline_events")
      .update({ is_deleted: true })
      .eq("id", id)
      .select(TIMELINE_AUDIT_SELECT)
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
  } catch (e) {
    // redirect()/notFound()는 예외로 동작한다. 여기서 삼키면 로그인 이동이 사라진다.
    unstable_rethrow(e);
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreTimeline(id: number): Promise<ActionState> {
  try {
    const gate = await requireEditor();
    if ("error" in gate) return { error: gate.error };
    const supabase = gate.supabase;
    const beforeRow = await getTimelineAuditRow(supabase, id);
    const { data: afterRow, error } = await supabase
      .from("timeline_events")
      .update({ is_deleted: false })
      .eq("id", id)
      .select(TIMELINE_AUDIT_SELECT)
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
  } catch (e) {
    // redirect()/notFound()는 예외로 동작한다. 여기서 삼키면 로그인 이동이 사라진다.
    unstable_rethrow(e);
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreTimelineVersion(
  payload: Record<string, unknown> | null | undefined,
): Promise<ActionState> {
  const row = parseTimelineAuditRow(payload);
  if (!row || !row.id || !row.title || !row.date || !row.year || !row.category) {
    return { error: "복원 가능한 타임라인 데이터가 없습니다." };
  }

  try {
    const gate = await requireEditor();
    if ("error" in gate) return { error: gate.error };
    const supabase = gate.supabase;
    const currentRow = await getTimelineAuditRow(supabase, row.id);
    // timeline_events.id도 GENERATED ALWAYS AS IDENTITY라 upsert에 id를 실으면 항상 거부된다.
    // 타임라인 역시 소프트 삭제만 하므로 update로 처리한다. (news/mutations.ts와 동일)
    const { data: updated, error } = await supabase
      .from("timeline_events")
      .update({
        date: row.date,
        year: row.year,
        title: row.title,
        description: row.description,
        category: row.category,
        image_url: row.image_url,
        image_alt: row.image_alt,
        sort_order: row.sort_order,
        is_deleted: row.is_deleted,
      })
      .eq("id", row.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return { error: friendlyTimelineError(error.message) };
    }
    if (!updated) {
      return { error: "복원 대상 타임라인을 찾을 수 없습니다." };
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
  } catch (e) {
    // redirect()/notFound()는 예외로 동작한다. 여기서 삼키면 로그인 이동이 사라진다.
    unstable_rethrow(e);
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
