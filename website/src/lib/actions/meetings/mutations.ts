import { redirect } from "next/navigation";
import { logAudit } from "@/lib/actions/audit";
import { requireEditor } from "@/lib/actions/auth";
import { replaceMeetingChildren } from "@/lib/actions/meetings/children";
import {
  friendlyMeetingError,
  validateMeetingForm,
} from "@/lib/actions/meetings/form";
import { revalidateMeetingPaths } from "@/lib/actions/meetings/revalidation";
import type { ParsedMeetingForm } from "@/lib/actions/meetings/types";
import type { ActionState } from "@/lib/actions/state";

function toMeetingPayload(form: ParsedMeetingForm) {
  return {
    title: form.title,
    meeting_no: form.meeting_no,
    meeting_date: form.meeting_date,
    meeting_time: form.meeting_time,
    location: form.location,
    format: form.format,
    status: form.status,
    purpose: form.purpose,
    notes: form.notes,
  };
}

export async function createMeeting(formData: FormData): Promise<ActionState> {
  const { data: form, error: validationError } = validateMeetingForm(formData);
  if (validationError || !form) {
    return { error: validationError ?? "입력값이 올바르지 않습니다." };
  }

  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const { supabase, user } = gate;

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      ...toMeetingPayload(form),
      created_by: user.email ?? null,
    })
    .select("id, title")
    .single();

  if (error || !meeting) {
    return { error: friendlyMeetingError(error?.message ?? "") };
  }

  const childResult = await replaceMeetingChildren(supabase, meeting.id, form);
  if (childResult.error) return { error: childResult.error };

  await logAudit(supabase, "meetings", meeting.id, "create", {
    entityKey: meeting.title,
    payload: { after: { ...form } },
  });

  revalidateMeetingPaths(meeting.id);
  redirect("/admin/meetings");
}

export async function updateMeeting(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  const { data: form, error: validationError } = validateMeetingForm(formData);
  if (validationError || !form) {
    return { error: validationError ?? "입력값이 올바르지 않습니다." };
  }

  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  const { data: meeting, error } = await supabase
    .from("meetings")
    .update({
      ...toMeetingPayload(form),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, title")
    .single();

  if (error || !meeting) {
    return { error: friendlyMeetingError(error?.message ?? "") };
  }

  const childResult = await replaceMeetingChildren(supabase, id, form);
  if (childResult.error) return { error: childResult.error };

  await logAudit(supabase, "meetings", id, "update", {
    entityKey: meeting.title,
    payload: { after: { ...form } },
  });

  revalidateMeetingPaths(id);
  redirect("/admin/meetings");
}

export async function deleteMeeting(id: number): Promise<ActionState> {
  try {
    const gate = await requireEditor();
    if ("error" in gate) return { error: gate.error };
    const supabase = gate.supabase;
    const { data, error } = await supabase
      .from("meetings")
      .update({ is_deleted: true })
      .eq("id", id)
      .select("title")
      .single();

    if (error) return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "meetings", id, "delete", {
      entityKey: data?.title ?? undefined,
    });
    revalidateMeetingPaths(id);
    return null;
  } catch {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreMeeting(id: number): Promise<ActionState> {
  try {
    const gate = await requireEditor();
    if ("error" in gate) return { error: gate.error };
    const supabase = gate.supabase;
    const { data, error } = await supabase
      .from("meetings")
      .update({ is_deleted: false })
      .eq("id", id)
      .select("title")
      .single();

    if (error) return { error: "복원에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "meetings", id, "restore", {
      entityKey: data?.title ?? undefined,
    });
    revalidateMeetingPaths(id);
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
