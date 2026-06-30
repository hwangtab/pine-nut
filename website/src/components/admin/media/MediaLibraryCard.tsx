import Image from "next/image";
import type { MediaItem } from "@/lib/data/media-library";

interface MediaLibraryCardProps {
  item: MediaItem;
  handleCopyUrl: (url: string) => Promise<void>;
  handleDelete: (path: string) => void;
}

export function MediaLibraryCard({
  item,
  handleCopyUrl,
  handleDelete,
}: MediaLibraryCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)]">
      <div className="relative aspect-[4/3] bg-[var(--color-bg)]">
        <Image src={item.url} alt={item.name} fill className="object-cover" />
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">
            {item.folder}
          </p>
          <h3 className="mt-1 line-clamp-1 text-base font-bold text-[var(--color-admin-text)]">
            {item.name}
          </h3>
        </div>
        <div className="text-sm text-[var(--color-admin-muted)]">
          {item.updatedAt
            ? new Intl.DateTimeFormat("ko-KR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(item.updatedAt))
            : "업데이트 시간 없음"}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCopyUrl(item.url)}
            className="min-h-[44px] rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
          >
            URL 복사
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
          >
            열기
          </a>
          <button
            type="button"
            onClick={() => handleDelete(item.path)}
            className="min-h-[44px] rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
