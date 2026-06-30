import { revalidatePath } from "next/cache";

export function revalidateMeetingPaths(id?: number) {
  revalidatePath("/admin/meetings");
  if (id) revalidatePath(`/admin/meetings/${id}/edit`);
}
