import { revalidatePath } from "next/cache";

export function revalidateTimelinePaths() {
  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  revalidatePath("/admin/history");
}
