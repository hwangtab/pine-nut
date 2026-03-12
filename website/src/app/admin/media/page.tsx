import MediaLibraryManager from "@/components/admin/MediaLibraryManager";
import { getMediaLibraryItems } from "@/lib/data/media-library";

export default async function AdminMediaPage() {
  const items = await getMediaLibraryItems();

  return <MediaLibraryManager initialItems={items} />;
}
