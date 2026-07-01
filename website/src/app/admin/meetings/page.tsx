import Link from "next/link";
import { getAllMeetings } from "@/lib/data/meetings";
import MeetingListActions from "./MeetingListActions";

export default async function AdminMeetingsPage() {
  const meetings = await getAllMeetings();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">회의록</h1>
        <Link href="/admin/meetings/new" className="px-6 py-3 bg-[var(--color-forest)] text-white font-bold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors text-base">
          + 새 회의록
        </Link>
      </div>

      {meetings.length === 0 ? (
        <p className="text-[var(--color-admin-muted)] text-center py-20">등록된 회의록이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.id} className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/admin/meetings/${m.id}`} className="min-w-0 flex-1 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${m.status === "completed" ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10" : "text-[var(--color-sky)] bg-[var(--color-sky)]/10"}`}>
                    {m.status === "completed" ? "완료" : "예정"}
                  </span>
                  {m.meetingNo != null && (
                    <span className="text-sm font-semibold text-[var(--color-admin-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded">#{m.meetingNo}</span>
                  )}
                </div>
                <h3 className="font-bold text-[var(--color-admin-text)]">{m.title}</h3>
                <p className="text-base text-[var(--color-admin-muted)]">
                  {[m.meetingDate, m.location, `참석 ${m.attendeeCount}명`].filter(Boolean).join(" · ")}
                </p>
              </Link>
              <MeetingListActions id={m.id} isDeleted={m.isDeleted} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
