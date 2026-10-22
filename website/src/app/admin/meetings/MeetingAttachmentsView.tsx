"use client";

import { useState } from "react";
import type { MeetingAttachment } from "@/lib/data/meetings";
import { getMeetingAttachmentUrl } from "@/lib/actions/meeting-attachments";

export default function MeetingAttachmentsView({ attachments }: { attachments: MeetingAttachment[] }) {
  const [error, setError] = useState<string | null>(null);
  if (attachments.length === 0) return null;

  async function handleDownload(filePath: string) {
    setError(null);
    // iOS Safari는 await 뒤의 window.open을 팝업으로 차단한다 → 클릭 직후 빈 창을 먼저 열고,
    // 서명 URL을 받은 뒤 그 창의 주소만 바꾼다. 빈 창을 못 열면(차단) 현재 탭에서 연다.
    const win = window.open("", "_blank");
    if (win) win.opener = null;
    const url = await getMeetingAttachmentUrl(filePath);
    if (!url) {
      win?.close();
      setError("다운로드 링크를 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (win) win.location.href = url;
    else window.location.assign(url);
  }

  return (
    <div>
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
      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
