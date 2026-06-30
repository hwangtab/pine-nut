import type { MediaItem } from "@/lib/data/media-library";
import { MediaLibraryCard } from "./MediaLibraryCard";

interface MediaLibraryGridProps {
  items: MediaItem[];
  handleCopyUrl: (url: string) => Promise<void>;
  handleDelete: (path: string) => void;
}

export function MediaLibraryGrid({
  items,
  handleCopyUrl,
  handleDelete,
}: MediaLibraryGridProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)]">저장된 이미지</h2>
        <p className="text-sm text-[var(--color-admin-muted)]">{items.length}개</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <MediaLibraryCard
            key={item.id}
            item={item}
            handleCopyUrl={handleCopyUrl}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}
