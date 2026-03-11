import { notFound } from "next/navigation";
import Link from "next/link";
import { getTimelineById } from "@/lib/data/timeline";
import { updateTimelineAction } from "@/lib/actions/timeline";
import TimelineForm from "@/components/admin/TimelineForm";

type Params = Promise<{ id: string }>;

export default async function AdminTimelineEditPage({ params }: { params: Params }) {
  const { id } = await params;
  const eventId = parseInt(id, 10);
  const event = await getTimelineById(eventId);

  if (!event) notFound();

  const boundAction = updateTimelineAction.bind(null, eventId);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/timeline" className="text-base text-gray-600 font-medium hover:text-gray-700 mb-4 inline-block">
        ← 타임라인 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">타임라인 수정: {event.title}</h1>
      <TimelineForm action={boundAction} initialData={event} submitLabel="저장하기" />
    </div>
  );
}
