import { createSupabaseServerClient } from "@/lib/supabase-server";

const MEDIA_FOLDERS = ["library", "page-content", "news", "timeline"] as const;

export interface MediaItem {
  id: string;
  name: string;
  folder: string;
  path: string;
  url: string;
  updatedAt: string | null;
  size: number | null;
  contentType: string | null;
}

export async function getMediaLibraryItems(): Promise<MediaItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const lists = await Promise.all(
    MEDIA_FOLDERS.map(async (folder) => {
      const { data } = await supabase.storage.from("images").list(folder, {
        limit: 100,
        sortBy: { column: "updated_at", order: "desc" },
      });

      if (!data) return [];

      return data
        .filter((item) => item.name && !item.id?.endsWith("/"))
        .map((item) => {
          const path = `${folder}/${item.name}`;
          const {
            data: { publicUrl },
          } = supabase.storage.from("images").getPublicUrl(path);

          return {
            id: `${folder}/${item.id ?? item.name}`,
            name: item.name,
            folder,
            path,
            url: publicUrl,
            updatedAt: item.updated_at ?? null,
            size:
              typeof item.metadata?.size === "number"
                ? item.metadata.size
                : null,
            contentType:
              typeof item.metadata?.mimetype === "string"
                ? item.metadata.mimetype
                : null,
          } satisfies MediaItem;
        });
    }),
  );

  return lists
    .flat()
    .sort((a, b) => {
      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return bTime - aTime;
    });
}
