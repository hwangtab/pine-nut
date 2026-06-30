"use client";

import type { MediaItem } from "@/lib/data/media-library";
import { MediaLibraryGrid } from "@/components/admin/media/MediaLibraryGrid";
import { MediaLibraryIntro } from "@/components/admin/media/MediaLibraryIntro";
import { MediaLibraryStatus } from "@/components/admin/media/MediaLibraryStatus";
import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";
import { useMediaLibraryManager } from "@/components/admin/media/useMediaLibraryManager";

interface MediaLibraryManagerProps {
  initialItems: MediaItem[];
}

export default function MediaLibraryManager({
  initialItems,
}: MediaLibraryManagerProps) {
  const media = useMediaLibraryManager(initialItems);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <MediaLibraryIntro />
      <MediaLibraryStatus message={media.message} error={media.error} />
      <MediaUploadPanel
        folder={media.folder}
        setFolder={media.setFolder}
        fileInputRef={media.fileInputRef}
        isPending={media.isPending}
        handleUpload={media.handleUpload}
      />
      <MediaLibraryGrid
        items={media.items}
        handleCopyUrl={media.handleCopyUrl}
        handleDelete={media.handleDelete}
      />
    </div>
  );
}
