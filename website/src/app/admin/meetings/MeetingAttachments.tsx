"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Download, Trash2 } from "lucide-react";
import { MAX_ATTACHMENT_MB, validateAttachmentSize } from "@/lib/attachment-limits";
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
  // 삭제·다운로드는 폼 액션이 아니라 직접 호출이라, 오류를 여기서 직접 보여주지 않으면
  // 실패가 화면에 전혀 드러나지 않는다.
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, startAction] = useTransition();

  async function handleDownload(filePath: string) {
    setActionError(null);
    const url = await getMeetingAttachmentUrl(filePath);
    if (url) window.open(url, "_blank");
    else setActionError("파일 주소를 가져오지 못했습니다. 다시 시도해주세요.");
  }

  function handleDelete(id: number) {
    if (!confirm("이 첨부파일을 삭제할까요?")) return;
    setActionError(null);
    startAction(async () => {
      const result = await deleteMeetingAttachmentAction(id, meetingId);
      if (result?.error) setActionError(result.error);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setActionError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // 서버 왕복 전에 즉시 안내한다(뉴스·타임라인 이미지 폼과 동일 패턴).
    const check = validateAttachmentSize(file);
    if (!check.ok) {
      setActionError(check.error);
      e.target.value = "";
    }
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
                <button type="button" onClick={() => handleDelete(f.id)} disabled={pendingAction} aria-label="삭제" className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors disabled:opacity-50"><Trash2 size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(state?.error || actionError) && (
        <p className="text-sm text-[var(--color-danger)]">{state?.error ?? actionError}</p>
      )}

      <form action={formAction} className="flex flex-col sm:flex-row gap-2 items-start">
        <input type="file" name="attachment_file" onChange={handleFileChange} className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-sky)]/10 file:text-[var(--color-sky)]" />
        <UploadButton />
      </form>
      <p className="text-sm text-[var(--color-admin-muted)]">{MAX_ATTACHMENT_MB}MB 이하. 업로드 즉시 저장됩니다(본문 저장과 별개).</p>
    </section>
  );
}
