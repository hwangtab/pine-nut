import { createSupabaseServerClient } from "@/lib/supabase-server";

const MEDIA_FOLDERS = ["library", "page-content", "news", "timeline"] as const;

const PAGE_SIZE = 500;
const MAX_MEDIA_ITEMS = 5_000;

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
      // 폴더당 100개만 읽으면 101번째부터는 목록에서 영영 사라져 삭제도 재사용도 못 한다.
      // offset을 밀어가며 전량을 읽는다(안전 상한 5,000개).
      const listPage = (offset: number) =>
        supabase.storage.from("images").list(folder, {
          limit: PAGE_SIZE,
          offset,
          sortBy: { column: "updated_at", order: "desc" },
        });

      const first = await listPage(0);
      if (!first.data) return [];
      const data = [...first.data];

      let pageLength = first.data.length;
      for (
        let offset = PAGE_SIZE;
        pageLength === PAGE_SIZE && offset < MAX_MEDIA_ITEMS;
        offset += PAGE_SIZE
      ) {
        const { data: page } = await listPage(offset);
        if (!page || page.length === 0) break;
        data.push(...page);
        pageLength = page.length;
      }

      if (data.length === 0) return [];

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
