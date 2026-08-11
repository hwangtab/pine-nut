import type { ParsedMeetingForm } from "@/lib/actions/meetings/types";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
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

export function validateMeetingForm(
  formData: FormData,
): { data: ParsedMeetingForm | null; error: string | null } {
  const title = str(formData, "title");
  if (!title) return { data: null, error: "회의 제목을 입력해주세요." };

  const status = str(formData, "status") ?? "scheduled";
  if (!["scheduled", "completed"].includes(status)) {
    return { data: null, error: "상태 값이 올바르지 않습니다." };
  }

  const format = str(formData, "format");
  if (format && !["online", "offline", "hybrid"].includes(format)) {
    return { data: null, error: "회의 형식 값이 올바르지 않습니다." };
  }

  const meetingNoRaw = str(formData, "meeting_no");
  const meetingNo =
    meetingNoRaw === null ? null : Number.parseInt(meetingNoRaw, 10);
  if (meetingNo !== null && Number.isNaN(meetingNo)) {
    return { data: null, error: "회차는 숫자로 입력해주세요." };
  }

  const attendees = parseJsonArray<{ name?: unknown; role?: unknown }>(
    formData,
    "attendees",
  )
    .map((attendee) => ({
      name: typeof attendee.name === "string" ? attendee.name.trim() : "",
      role:
        typeof attendee.role === "string" && attendee.role.trim() !== ""
          ? attendee.role.trim()
          : null,
    }))
    .filter((attendee) => attendee.name !== "" || attendee.role !== null);
  // 이름 없이 역할만 적힌 행은 조용히 버리면 입력한 내용이 사라진다. 저장을 막고 알린다.
  if (attendees.some((attendee) => attendee.name === "")) {
    return { data: null, error: "참석자 이름을 입력해주세요. (역할만 입력된 행이 있습니다)" };
  }

  const agendas = parseJsonArray<{ title?: unknown; discussion?: unknown }>(
    formData,
    "agendas",
  )
    .map((agenda) => ({
      title: typeof agenda.title === "string" ? agenda.title.trim() : "",
      discussion:
        typeof agenda.discussion === "string" &&
        agenda.discussion.trim() !== ""
          ? agenda.discussion.trim()
          : null,
    }))
    .filter((agenda) => agenda.title !== "" || agenda.discussion !== null);
  if (agendas.some((agenda) => agenda.title === "")) {
    return { data: null, error: "안건 제목을 입력해주세요. (논의내용만 입력된 행이 있습니다)" };
  }

  const decisions = parseJsonArray<{ content?: unknown }>(formData, "decisions")
    .map((decision) => ({
      content:
        typeof decision.content === "string" ? decision.content.trim() : "",
    }))
    .filter((decision) => decision.content !== "");

  const actionItems = parseJsonArray<{
    owner?: unknown;
    task?: unknown;
    due_text?: unknown;
    is_done?: unknown;
  }>(formData, "action_items")
    .map((item) => ({
      owner:
        typeof item.owner === "string" && item.owner.trim() !== ""
          ? item.owner.trim()
          : null,
      task: typeof item.task === "string" ? item.task.trim() : "",
      due_text:
        typeof item.due_text === "string" && item.due_text.trim() !== ""
          ? item.due_text.trim()
          : null,
      is_done: item.is_done === true,
    }))
    .filter((item) => item.task !== "" || item.owner !== null || item.due_text !== null);
  if (actionItems.some((item) => item.task === "")) {
    return { data: null, error: "할 일 내용을 입력해주세요. (담당자·기한만 입력된 행이 있습니다)" };
  }

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
      attendees,
      agendas,
      decisions,
      action_items: actionItems,
    },
    error: null,
  };
}

export function friendlyMeetingError(message: string): string {
  if (message.includes("violates row-level security")) {
    return "권한이 없습니다. 다시 로그인해주세요.";
  }

  return "회의록 저장에 실패했습니다. 잠시 후 다시 시도해주세요.";
}
