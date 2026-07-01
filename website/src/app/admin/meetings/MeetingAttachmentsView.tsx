"use client";

import type { MeetingAttachment } from "@/lib/data/meetings";
import { getMeetingAttachmentUrl } from "@/lib/actions/meeting-attachments";

export default function MeetingAttachmentsView({ attachments }: { attachments: MeetingAttachment[] }) {
  if (attachments.length === 0) return null;

  async function handleDownload(filePath: string) {
    const url = await getMeetingAttachmentUrl(filePath);
    if (url) window.open(url, "_blank");
  }

  return (
    <ul className="space-y-2">
      {attachments.map((att) => (
        <li key={att.id} className="flex items-center justify-between gap-4">
          <span className="text-[var(--color-admin-text)] truncate">{att.fileName}</span>
          <button
            onClick={() => handleDownload(att.filePath)}
            className="shrink-0 px-3 py-1.5 text-sm font-semibold text-[var(--color-sky)] bg-[var(--color-sky)]/10 rounded-lg hover:bg-[var(--color-sky)]/20 transition-colors"
          >
            다운로드
          </button>
        </li>
      ))}
    </ul>
  );
}
