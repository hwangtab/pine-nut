import Link from "next/link";
import MeetingForm from "@/components/admin/MeetingForm";
import { createMeetingAction } from "@/lib/actions/meetings";

export default function NewMeetingPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/meetings" className="text-base text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]">← 회의록 목록</Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold text-[var(--color-admin-text)]">새 회의록</h1>
      <MeetingForm action={createMeetingAction} submitLabel="회의록 저장" />
    </div>
  );
}
