export interface AttendeeInput {
  name: string;
  role: string | null;
}

export interface AgendaInput {
  title: string;
  discussion: string | null;
}

export interface DecisionInput {
  content: string;
}

export interface ActionItemInput {
  owner: string | null;
  task: string;
  due_text: string | null;
  is_done: boolean;
}

export interface ParsedMeetingForm {
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
