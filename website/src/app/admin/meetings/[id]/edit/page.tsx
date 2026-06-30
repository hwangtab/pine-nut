import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingForm from "@/components/admin/MeetingForm";
import { getMeetingById } from "@/lib/data/meetings";
import { updateMeetingAction } from "@/lib/actions/meetings";

export default async function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) notFound();

  const meeting = await getMeetingById(id);
  if (!meeting) notFound();

  const action = updateMeetingAction.bind(null, id);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/meetings" className="text-base text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]">← 회의록 목록</Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold text-[var(--color-admin-text)]">회의록 편집</h1>
      <MeetingForm action={action} initialData={meeting} submitLabel="변경사항 저장" meetingId={id} />
    </div>
  );
}
