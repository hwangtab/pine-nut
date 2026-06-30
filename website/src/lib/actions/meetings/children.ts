import type { SupabaseClient } from "@supabase/supabase-js";
import { friendlyMeetingError } from "@/lib/actions/meetings/form";
import type { ParsedMeetingForm } from "@/lib/actions/meetings/types";

export async function replaceMeetingChildren(
  supabase: SupabaseClient,
  meetingId: number,
  form: ParsedMeetingForm,
): Promise<{ error?: string }> {
  for (const table of [
    "meeting_attendees",
    "meeting_agendas",
    "meeting_decisions",
    "meeting_action_items",
  ]) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("meeting_id", meetingId);
    if (error) return { error: friendlyMeetingError(error.message) };
  }

  if (form.attendees.length > 0) {
    const { error } = await supabase.from("meeting_attendees").insert(
      form.attendees.map((attendee, index) => ({
        meeting_id: meetingId,
        name: attendee.name,
        role: attendee.role,
        sort_order: index,
      })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }

  if (form.agendas.length > 0) {
    const { error } = await supabase.from("meeting_agendas").insert(
      form.agendas.map((agenda, index) => ({
        meeting_id: meetingId,
        title: agenda.title,
        discussion: agenda.discussion,
        sort_order: index,
      })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }

  if (form.decisions.length > 0) {
    const { error } = await supabase.from("meeting_decisions").insert(
      form.decisions.map((decision, index) => ({
        meeting_id: meetingId,
        content: decision.content,
        sort_order: index,
      })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }

  if (form.action_items.length > 0) {
    const { error } = await supabase.from("meeting_action_items").insert(
      form.action_items.map((item, index) => ({
        meeting_id: meetingId,
        owner: item.owner,
        task: item.task,
        due_text: item.due_text,
        is_done: item.is_done,
        sort_order: index,
      })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }

  return {};
}
