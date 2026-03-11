import Link from "next/link";
import { createTimelineAction } from "@/lib/actions/timeline";
import TimelineForm from "@/components/admin/TimelineForm";

export default async function AdminTimelineNewPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/timeline" className="text-base text-gray-600 font-medium hover:text-gray-700 mb-4 inline-block">
        ← 타임라인 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">새 타임라인 이벤트</h1>
      <TimelineForm action={createTimelineAction} submitLabel="등록하기" />
    </div>
  );
}
