"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Download, Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/state";
import type { MeetingAttachment } from "@/lib/data/meetings";
import {
  uploadMeetingAttachmentAction,
  deleteMeetingAttachmentAction,
  getMeetingAttachmentUrl,
} from "@/lib/actions/meeting-attachments";

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-5 py-3 text-base font-bold text-white bg-[var(--color-sky)] hover:bg-[var(--color-forest)] rounded-xl transition-colors disabled:opacity-50">
      {pending ? "업로드 중..." : "업로드"}
    </button>
  );
}

export default function MeetingAttachments({ meetingId, attachments }: { meetingId: number; attachments: MeetingAttachment[] }) {
  const upload = uploadMeetingAttachmentAction.bind(null, meetingId);
  const [state, formAction] = useActionState(upload, null as ActionState);

  async function handleDownload(filePath: string) {
    const url = await getMeetingAttachmentUrl(filePath);
    if (url) window.open(url, "_blank");
  }

  async function handleDelete(id: number) {
    if (!confirm("이 첨부파일을 삭제할까요?")) return;
    await deleteMeetingAttachmentAction(id, meetingId);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-[var(--color-admin-text)]">첨부파일</h2>

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-admin-border)] px-4 py-3">
              <span className="min-w-0 truncate text-base text-[var(--color-admin-text)]">{f.fileName}</span>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => handleDownload(f.filePath)} aria-label="다운로드" className="p-2 text-[var(--color-sky)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"><Download size={18} /></button>
                <button type="button" onClick={() => handleDelete(f.id)} aria-label="삭제" className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors"><Trash2 size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-col sm:flex-row gap-2 items-start">
        {state?.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
        <input type="file" name="attachment_file" className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-sky)]/10 file:text-[var(--color-sky)]" />
        <UploadButton />
      </form>
      <p className="text-sm text-[var(--color-admin-muted)]">20MB 이하. 업로드 즉시 저장됩니다(본문 저장과 별개).</p>
    </section>
  );
}
