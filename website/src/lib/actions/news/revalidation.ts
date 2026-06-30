import { revalidatePath } from "next/cache";

export function revalidateNewsPaths(...slugs: Array<string | null | undefined>) {
  revalidatePath("/news");
  [...new Set(slugs.filter((slug): slug is string => !!slug))].forEach((slug) => {
    revalidatePath(`/news/${slug}`);
  });
  revalidatePath("/admin/news");
  revalidatePath("/admin/history");
}
