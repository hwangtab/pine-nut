import { notFound } from "next/navigation";
import Link from "next/link";
import { getTimelineById } from "@/lib/data/timeline";
import { updateTimelineAction } from "@/lib/actions/timeline";
import TimelineForm from "@/components/admin/TimelineForm";

type Params = Promise<{ id: string }>;

export default async function AdminTimelineEditPage({ params }: { params: Params }) {
  const { id } = await params;
  // 숫자가 아닌 id면 DB 쿼리가 22P02로 터져 프로덕션에서 500이 난다. 404가 맞다.
  const eventId = Number.parseInt(id, 10);
  if (!Number.isInteger(eventId) || eventId <= 0) notFound();
  const event = await getTimelineById(eventId);

  if (!event) notFound();

  const boundAction = updateTimelineAction.bind(null, eventId);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/timeline" className="min-h-[44px] inline-flex items-center text-base text-[var(--color-admin-muted)] font-medium hover:text-[var(--color-admin-text)] mb-4">
        ← 타임라인 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-8 break-words">타임라인 수정: {event.title}</h1>
      <TimelineForm action={boundAction} initialData={event} submitLabel="저장하기" />
    </div>
  );
}
