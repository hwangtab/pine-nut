import Link from "next/link";
import { createTimelineAction } from "@/lib/actions/timeline";
import TimelineForm from "@/components/admin/TimelineForm";

export default async function AdminTimelineNewPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/timeline" className="min-h-[44px] inline-flex items-center text-base text-[var(--color-admin-muted)] font-medium hover:text-[var(--color-admin-text)] mb-4">
        ← 타임라인 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-8">새 타임라인 이벤트</h1>
      <TimelineForm action={createTimelineAction} submitLabel="등록하기" />
    </div>
  );
}
