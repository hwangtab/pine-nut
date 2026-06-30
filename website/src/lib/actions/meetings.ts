"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedActionClient } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";

interface AttendeeInput { name: string; role: string | null; }
interface AgendaInput { title: string; discussion: string | null; }
interface DecisionInput { content: string; }
interface ActionItemInput { owner: string | null; task: string; due_text: string | null; is_done: boolean; }

interface ParsedMeetingForm {
  title: string;
  meeting_no: number | null;
  meeting_date: string | null;
  meeting_time: string | null;
  location: string | null;
  format: string | null;
  status: string;
  purpose: string | null;
  notes: string | null;
  attendees: AttendeeInput[];
  agendas: AgendaInput[];
  decisions: DecisionInput[];
  action_items: ActionItemInput[];
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function parseJsonArray<T>(formData: FormData, key: string): T[] {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function validateMeetingForm(formData: FormData): { data?: ParsedMeetingForm; error?: string } {
  const title = str(formData, "title");
  if (!title) return { error: "회의 제목을 입력해주세요." };

  const status = str(formData, "status") ?? "scheduled";
  if (!["scheduled", "completed"].includes(status)) return { error: "상태 값이 올바르지 않습니다." };

  const format = str(formData, "format");
  if (format && !["online", "offline", "hybrid"].includes(format)) {
    return { error: "회의 형식 값이 올바르지 않습니다." };
  }

  const meetingNoRaw = str(formData, "meeting_no");
  const meetingNo = meetingNoRaw === null ? null : Number.parseInt(meetingNoRaw, 10);
  if (meetingNo !== null && Number.isNaN(meetingNo)) return { error: "회차는 숫자로 입력해주세요." };

  const attendees = parseJsonArray<{ name?: unknown; role?: unknown }>(formData, "attendees")
    .map((a) => ({ name: typeof a.name === "string" ? a.name.trim() : "", role: typeof a.role === "string" && a.role.trim() !== "" ? a.role.trim() : null }))
    .filter((a) => a.name !== "");

  const agendas = parseJsonArray<{ title?: unknown; discussion?: unknown }>(formData, "agendas")
    .map((a) => ({ title: typeof a.title === "string" ? a.title.trim() : "", discussion: typeof a.discussion === "string" && a.discussion.trim() !== "" ? a.discussion.trim() : null }))
    .filter((a) => a.title !== "");

  const decisions = parseJsonArray<{ content?: unknown }>(formData, "decisions")
    .map((d) => ({ content: typeof d.content === "string" ? d.content.trim() : "" }))
    .filter((d) => d.content !== "");

  const action_items = parseJsonArray<{ owner?: unknown; task?: unknown; due_text?: unknown; is_done?: unknown }>(formData, "action_items")
    .map((it) => ({
      owner: typeof it.owner === "string" && it.owner.trim() !== "" ? it.owner.trim() : null,
      task: typeof it.task === "string" ? it.task.trim() : "",
      due_text: typeof it.due_text === "string" && it.due_text.trim() !== "" ? it.due_text.trim() : null,
      is_done: it.is_done === true,
    }))
    .filter((it) => it.task !== "");

  return {
    data: {
      title,
      meeting_no: meetingNo,
      meeting_date: str(formData, "meeting_date"),
      meeting_time: str(formData, "meeting_time"),
      location: str(formData, "location"),
      format,
      status,
      purpose: str(formData, "purpose"),
      notes: str(formData, "notes"),
      attendees, agendas, decisions, action_items,
    },
  };
}

function friendlyMeetingError(message: string): string {
  if (message.includes("violates row-level security")) return "권한이 없습니다. 다시 로그인해주세요.";
  return "회의록 저장에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

async function replaceChildren(
  supabase: SupabaseClient,
  meetingId: number,
  form: ParsedMeetingForm,
): Promise<{ error?: string }> {
  // 기존 하위 항목 삭제 (첨부 제외)
  for (const table of ["meeting_attendees", "meeting_agendas", "meeting_decisions", "meeting_action_items"]) {
    const { error } = await supabase.from(table).delete().eq("meeting_id", meetingId);
    if (error) return { error: friendlyMeetingError(error.message) };
  }

  if (form.attendees.length > 0) {
    const { error } = await supabase.from("meeting_attendees").insert(
      form.attendees.map((a, i) => ({ meeting_id: meetingId, name: a.name, role: a.role, sort_order: i })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  if (form.agendas.length > 0) {
    const { error } = await supabase.from("meeting_agendas").insert(
      form.agendas.map((a, i) => ({ meeting_id: meetingId, title: a.title, discussion: a.discussion, sort_order: i })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  if (form.decisions.length > 0) {
    const { error } = await supabase.from("meeting_decisions").insert(
      form.decisions.map((d, i) => ({ meeting_id: meetingId, content: d.content, sort_order: i })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  if (form.action_items.length > 0) {
    const { error } = await supabase.from("meeting_action_items").insert(
      form.action_items.map((it, i) => ({
        meeting_id: meetingId, owner: it.owner, task: it.task, due_text: it.due_text, is_done: it.is_done, sort_order: i,
      })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  return {};
}

function revalidateMeetingPaths(id?: number) {
  revalidatePath("/admin/meetings");
  if (id) revalidatePath(`/admin/meetings/${id}/edit`);
}

export async function createMeetingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: form, error: validationError } = validateMeetingForm(formData);
  if (validationError || !form) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      title: form.title, meeting_no: form.meeting_no, meeting_date: form.meeting_date,
      meeting_time: form.meeting_time, location: form.location, format: form.format,
      status: form.status, purpose: form.purpose, notes: form.notes,
      created_by: user?.email ?? null,
    })
    .select("id, title")
    .single();

  if (error || !meeting) return { error: friendlyMeetingError(error?.message ?? "") };

  const childResult = await replaceChildren(supabase, meeting.id, form);
  if (childResult.error) return { error: childResult.error };

  await logAudit(supabase, "meetings", meeting.id, "create", {
    entityKey: meeting.title,
    payload: { after: { ...form } },
  });

  revalidateMeetingPaths(meeting.id);
  redirect("/admin/meetings");
}

export async function updateMeetingAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: form, error: validationError } = validateMeetingForm(formData);
  if (validationError || !form) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedActionClient();

  const { data: meeting, error } = await supabase
    .from("meetings")
    .update({
      title: form.title, meeting_no: form.meeting_no, meeting_date: form.meeting_date,
      meeting_time: form.meeting_time, location: form.location, format: form.format,
      status: form.status, purpose: form.purpose, notes: form.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, title")
    .single();

  if (error || !meeting) return { error: friendlyMeetingError(error?.message ?? "") };

  const childResult = await replaceChildren(supabase, id, form);
  if (childResult.error) return { error: childResult.error };

  await logAudit(supabase, "meetings", id, "update", {
    entityKey: meeting.title,
    payload: { after: { ...form } },
  });

  revalidateMeetingPaths(id);
  redirect("/admin/meetings");
}

export async function deleteMeetingAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedActionClient();
    const { data, error } = await supabase
      .from("meetings").update({ is_deleted: true }).eq("id", id).select("title").single();
    if (error) return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "meetings", id, "delete", { entityKey: data?.title ?? undefined });
    revalidateMeetingPaths(id);
    return null;
  } catch {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreMeetingAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedActionClient();
    const { data, error } = await supabase
      .from("meetings").update({ is_deleted: false }).eq("id", id).select("title").single();
    if (error) return { error: "복원에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "meetings", id, "restore", { entityKey: data?.title ?? undefined });
    revalidateMeetingPaths(id);
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
