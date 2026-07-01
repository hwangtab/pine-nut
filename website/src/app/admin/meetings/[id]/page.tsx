import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeetingById } from "@/lib/data/meetings";
import MeetingAttachmentsView from "../MeetingAttachmentsView";

const FORMAT_LABELS: Record<string, string> = {
  online: "온라인",
  offline: "오프라인",
  hybrid: "하이브리드",
};

export default async function MeetingViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) notFound();

  const meeting = await getMeetingById(id);
  if (!meeting) notFound();

  const metaParts = [
    meeting.meetingDate,
    meeting.meetingTime,
    meeting.location,
    meeting.format ? FORMAT_LABELS[meeting.format] : null,
  ].filter(Boolean);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/admin/meetings"
          className="text-base text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]"
        >
          ← 목록
        </Link>
        <Link
          href={`/admin/meetings/${id}/edit`}
          className="px-4 py-2 text-sm font-semibold text-[var(--color-sky)] bg-[var(--color-sky)]/10 rounded-lg hover:bg-[var(--color-sky)]/20 transition-colors"
        >
          편집
        </Link>
      </div>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-sm font-semibold px-2 py-0.5 rounded ${
                meeting.status === "completed"
                  ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10"
                  : "text-[var(--color-sky)] bg-[var(--color-sky)]/10"
              }`}
            >
              {meeting.status === "completed" ? "완료" : "예정"}
            </span>
            {meeting.meetingNo != null && (
              <span className="text-sm font-semibold text-[var(--color-admin-muted)] bg-[var(--color-admin-bg)] px-2 py-0.5 rounded">
                #{meeting.meetingNo}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">{meeting.title}</h1>
          {metaParts.length > 0 && (
            <p className="mt-2 text-base text-[var(--color-admin-muted)]">{metaParts.join(" · ")}</p>
          )}
        </div>

        {/* 목적 */}
        {meeting.purpose && (
          <Section title="목적">
            <p className="text-[var(--color-admin-text)] whitespace-pre-line">{meeting.purpose}</p>
          </Section>
        )}

        {/* 참석자 */}
        {meeting.attendees.length > 0 && (
          <Section title="참석자">
            <ul className="space-y-1">
              {meeting.attendees.map((a) => (
                <li key={a.id} className="flex items-baseline gap-2">
                  <span className="font-medium text-[var(--color-admin-text)]">{a.name}</span>
                  {a.role && (
                    <span className="text-sm text-[var(--color-admin-muted)]">{a.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 안건 */}
        {meeting.agendas.length > 0 && (
          <Section title="안건">
            <div className="space-y-4">
              {meeting.agendas.map((ag, idx) => (
                <div key={ag.id}>
                  <p className="font-bold text-[var(--color-admin-text)]">
                    {idx + 1}. {ag.title}
                  </p>
                  {ag.discussion && (
                    <p className="mt-1 text-[var(--color-admin-text)] whitespace-pre-line text-base">
                      {ag.discussion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 결정사항 */}
        {meeting.decisions.length > 0 && (
          <Section title="결정사항">
            <ol className="list-decimal list-inside space-y-1">
              {meeting.decisions.map((d) => (
                <li key={d.id} className="text-[var(--color-admin-text)]">
                  {d.content}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* 액션아이템 */}
        {meeting.actionItems.length > 0 && (
          <Section title="액션아이템">
            <ul className="space-y-2">
              {meeting.actionItems.map((it) => (
                <li key={it.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 text-sm font-semibold shrink-0 ${
                      it.isDone
                        ? "text-[var(--color-forest)]"
                        : "text-[var(--color-admin-muted)]"
                    }`}
                  >
                    {it.isDone ? "✓ 완료" : "○"}
                  </span>
                  <span className="text-[var(--color-admin-text)]">
                    {it.owner && (
                      <span className="font-medium">{it.owner} · </span>
                    )}
                    {it.task}
                    {it.dueText && (
                      <span className="text-sm text-[var(--color-admin-muted)]"> · {it.dueText}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 비고 */}
        {meeting.notes && (
          <Section title="비고">
            <p className="text-[var(--color-admin-text)] whitespace-pre-line">{meeting.notes}</p>
          </Section>
        )}

        {/* 첨부파일 */}
        {meeting.attachments.length > 0 && (
          <Section title="첨부파일">
            <MeetingAttachmentsView attachments={meeting.attachments} />
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-5">
      <h2 className="text-sm font-semibold text-[var(--color-admin-muted)] uppercase tracking-wide mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
