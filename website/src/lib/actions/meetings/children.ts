import type { SupabaseClient } from "@supabase/supabase-js";
import { friendlyMeetingError } from "@/lib/actions/meetings/form";
import type { ParsedMeetingForm } from "@/lib/actions/meetings/types";

const CHILD_TABLES = [
  "meeting_attendees",
  "meeting_agendas",
  "meeting_decisions",
  "meeting_action_items",
] as const;

type ChildRows = Record<string, Record<string, unknown>[]>;

function toRows(meetingId: number, form: ParsedMeetingForm): ChildRows {
  return {
    meeting_attendees: form.attendees.map((attendee, index) => ({
      meeting_id: meetingId,
      name: attendee.name,
      role: attendee.role,
      sort_order: index,
    })),
    meeting_agendas: form.agendas.map((agenda, index) => ({
      meeting_id: meetingId,
      title: agenda.title,
      discussion: agenda.discussion,
      sort_order: index,
    })),
    meeting_decisions: form.decisions.map((decision, index) => ({
      meeting_id: meetingId,
      content: decision.content,
      sort_order: index,
    })),
    meeting_action_items: form.action_items.map((item, index) => ({
      meeting_id: meetingId,
      owner: item.owner,
      task: item.task,
      due_text: item.due_text,
      is_done: item.is_done,
      sort_order: index,
    })),
  };
}

// RPC가 아직 배포되지 않은 환경(마이그레이션 미적용)을 위한 폴백.
// 트랜잭션이 없으므로, 삭제 전에 원본을 메모리에 백업했다가 실패 시 되돌린다.
async function replaceWithCompensation(
  supabase: SupabaseClient,
  meetingId: number,
  rows: ChildRows,
): Promise<{ error?: string }> {
  const backup: ChildRows = {};
  for (const table of CHILD_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("meeting_id", meetingId);
    if (error) return { error: friendlyMeetingError(error.message) };
    // id는 GENERATED ALWAYS라 되돌릴 때 다시 넣을 수 없다 → 제외하고 보관한다.
    backup[table] = (data ?? []).map((row: Record<string, unknown>) => {
      const { id: _id, ...rest } = row;
      void _id;
      return rest;
    });
  }

  const rollback = async () => {
    for (const table of CHILD_TABLES) {
      await supabase.from(table).delete().eq("meeting_id", meetingId);
      if (backup[table].length > 0) {
        await supabase.from(table).insert(backup[table]);
      }
    }
  };

  for (const table of CHILD_TABLES) {
    const { error } = await supabase.from(table).delete().eq("meeting_id", meetingId);
    if (error) {
      await rollback();
      return { error: friendlyMeetingError(error.message) };
    }
  }

  for (const table of CHILD_TABLES) {
    if (rows[table].length === 0) continue;
    const { error } = await supabase.from(table).insert(rows[table]);
    if (error) {
      await rollback();
      return { error: friendlyMeetingError(error.message) };
    }
  }

  return {};
}

export async function replaceMeetingChildren(
  supabase: SupabaseClient,
  meetingId: number,
  form: ParsedMeetingForm,
): Promise<{ error?: string }> {
  // 원자적 경로: delete + insert 전체가 한 트랜잭션 안에서 수행된다.
  const { error } = await supabase.rpc("replace_meeting_children", {
    p_meeting_id: meetingId,
    p_attendees: form.attendees,
    p_agendas: form.agendas,
    p_decisions: form.decisions,
    p_action_items: form.action_items,
  });

  if (!error) return {};

  // 함수가 아직 없는 환경(PGRST202: 스키마 캐시에서 함수를 찾지 못함)에서만 폴백한다.
  // 권한 거부·제약 위반 등 진짜 실패는 그대로 사용자에게 알린다.
  const missingFunction =
    error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
  if (!missingFunction) {
    return { error: friendlyMeetingError(error.message) };
  }

  return replaceWithCompensation(supabase, meetingId, toRows(meetingId, form));
}
