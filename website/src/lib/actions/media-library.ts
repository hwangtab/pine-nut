"use server";

import { revalidatePath } from "next/cache";
import { uploadImageFromFormData } from "@/lib/storage/upload";
import { getAuthenticatedActionClient } from "./auth";
import { logAudit } from "./audit";

export async function uploadMediaLibraryAction(
  formData: FormData,
): Promise<{ url: string | null; path: string | null; error: string | null }> {
  const supabase = await getAuthenticatedActionClient();
  const folder = ((formData.get("folder") as string) || "library").trim() || "library";
  const file = formData.get("file") as File | null;

  const uploadResult = await uploadImageFromFormData(supabase, file, folder);
  if (uploadResult.error) {
    return { ...uploadResult, path: null };
  }

  if (uploadResult.url) {
    await logAudit(supabase, "storage.images", 0, "create", {
      entityKey: uploadResult.url,
      payload: {
        folder,
        url: uploadResult.url,
      },
    });
  }

  revalidatePath("/admin/media");
  return {
    ...uploadResult,
    path: uploadResult.url
      ? uploadResult.url.replace(/^.*\/object\/public\/images\//, "")
      : null,
  };
}

export async function deleteMediaLibraryItemAction(
  path: string,
): Promise<{ error: string | null }> {
  const supabase = await getAuthenticatedActionClient();
  const { error } = await supabase.storage.from("images").remove([path]);

  if (error) {
    return { error: "이미지 삭제에 실패했습니다. 다시 시도해주세요." };
  }

  await logAudit(supabase, "storage.images", 0, "delete", {
    entityKey: path,
    payload: {
      path,
    },
  });

  revalidatePath("/admin/media");
  return { error: null };
}
