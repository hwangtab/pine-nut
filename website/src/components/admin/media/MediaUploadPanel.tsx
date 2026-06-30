import type { RefObject } from "react";

interface MediaUploadPanelProps {
  folder: string;
  setFolder: (folder: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isPending: boolean;
  handleUpload: () => void;
}

export function MediaUploadPanel({
  folder,
  setFolder,
  fileInputRef,
  isPending,
  handleUpload,
}: MediaUploadPanelProps) {
  return (
    <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
      <h2 className="text-lg font-bold text-[var(--color-admin-text)]">새 이미지 업로드</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr_auto]">
        <select
          value={folder}
          onChange={(event) => setFolder(event.target.value)}
          className="min-w-0 rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
        >
          <option value="library">library</option>
          <option value="page-content">page-content</option>
          <option value="news">news</option>
          <option value="timeline">timeline</option>
        </select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="min-w-0 w-full rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)]"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={isPending}
          className="w-full rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40 md:w-auto"
        >
          {isPending ? "처리 중..." : "업로드"}
        </button>
      </div>
    </section>
  );
}
