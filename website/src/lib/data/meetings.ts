import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface Meeting {
  id: number;
  title: string;
  meetingNo: number | null;
  meetingDate: string | null;
  meetingTime: string | null;
  location: string | null;
  format: "online" | "offline" | "hybrid" | null;
  status: "scheduled" | "completed";
  purpose: string | null;
  notes: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingAttendee { id: number; name: string; role: string | null; sortOrder: number; }
export interface MeetingAgenda { id: number; title: string; discussion: string | null; sortOrder: number; }
export interface MeetingDecision { id: number; content: string; sortOrder: number; }
export interface MeetingActionItem {
  id: number; owner: string | null; task: string; dueText: string | null; isDone: boolean; sortOrder: number;
}
export interface MeetingAttachment {
  id: number; filePath: string; fileName: string; fileSize: number | null; mimeType: string | null; createdAt: string;
}

export interface MeetingDetail extends Meeting {
  attendees: MeetingAttendee[];
  agendas: MeetingAgenda[];
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  attachments: MeetingAttachment[];
}

export interface MeetingListItem extends Meeting {
  attendeeCount: number;
}

interface MeetingRow {
  id: number; title: string; meeting_no: number | null; meeting_date: string | null;
  meeting_time: string | null; location: string | null;
  format: "online" | "offline" | "hybrid" | null; status: "scheduled" | "completed";
  purpose: string | null; notes: string | null; is_deleted: boolean;
  created_at: string; updated_at: string;
}

function rowToMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id, title: row.title, meetingNo: row.meeting_no, meetingDate: row.meeting_date,
    meetingTime: row.meeting_time, location: row.location, format: row.format, status: row.status,
    purpose: row.purpose, notes: row.notes, isDeleted: row.is_deleted,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export async function getAllMeetings(): Promise<MeetingListItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("meetings")
    .select("*, meeting_attendees(count)")
    .eq("is_deleted", false)
    .order("meeting_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch meetings:", error);
    return [];
  }

  return data.map((row: MeetingRow & { meeting_attendees: { count: number }[] }) => ({
    ...rowToMeeting(row),
    attendeeCount: row.meeting_attendees?.[0]?.count ?? 0,
  }));
}

export async function getMeetingById(id: number): Promise<MeetingDetail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("meetings")
    .select(`*,
      meeting_attendees(id, name, role, sort_order),
      meeting_agendas(id, title, discussion, sort_order),
      meeting_decisions(id, content, sort_order),
      meeting_action_items(id, owner, task, due_text, is_done, sort_order),
      meeting_attachments(id, file_path, file_name, file_size, mime_type, created_at)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch meeting ${id}:`, error);
    return null;
  }
  if (!data) return null;

  type AttendeeRow = { id: number; name: string; role: string | null; sort_order: number };
  type AgendaRow = { id: number; title: string; discussion: string | null; sort_order: number };
  type DecisionRow = { id: number; content: string; sort_order: number };
  type ActionItemRow = { id: number; owner: string | null; task: string; due_text: string | null; is_done: boolean; sort_order: number };

  const sortByOrder = <T extends { sort_order: number }>(arr: T[]): T[] =>
    [...arr].sort((a, b) => a.sort_order - b.sort_order);

  const attendees: AttendeeRow[] = (data.meeting_attendees as AttendeeRow[]) ?? [];
  const agendas: AgendaRow[] = (data.meeting_agendas as AgendaRow[]) ?? [];
  const decisions: DecisionRow[] = (data.meeting_decisions as DecisionRow[]) ?? [];
  const actionItems: ActionItemRow[] = (data.meeting_action_items as ActionItemRow[]) ?? [];

  return {
    ...rowToMeeting(data),
    attendees: sortByOrder(attendees).map((a) => ({
      id: a.id, name: a.name, role: a.role, sortOrder: a.sort_order,
    })),
    agendas: sortByOrder(agendas).map((a) => ({
      id: a.id, title: a.title, discussion: a.discussion, sortOrder: a.sort_order,
    })),
    decisions: sortByOrder(decisions).map((d) => ({
      id: d.id, content: d.content, sortOrder: d.sort_order,
    })),
    actionItems: sortByOrder(actionItems).map((it) => ({
      id: it.id, owner: it.owner, task: it.task, dueText: it.due_text, isDone: it.is_done, sortOrder: it.sort_order,
    })),
    attachments: (data.meeting_attachments ?? [])
      .sort((a: { created_at: string }, b: { created_at: string }) => a.created_at.localeCompare(b.created_at))
      .map((f: { id: number; file_path: string; file_name: string; file_size: number | null; mime_type: string | null; created_at: string }) => ({
        id: f.id, filePath: f.file_path, fileName: f.file_name, fileSize: f.file_size, mimeType: f.mime_type, createdAt: f.created_at,
      })),
  };
}
