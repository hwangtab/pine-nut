import type { SupabaseClient } from "@supabase/supabase-js";
import { IMAGE_EXT_BY_TYPE, validateImageFile } from "@/lib/image-upload-limits";

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export async function uploadImageFromFormData(
  supabase: SupabaseClient,
  file: File | null,
  folder: string,
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { url: null, error: null };
  }

  // 클라이언트와 동일한 규칙으로 최종 방어(클라 검증이 우회돼도 서버가 거른다)
  const validation = validateImageFile(file);
  if (!validation.ok) {
    return { url: null, error: validation.error };
  }

  const ext = IMAGE_EXT_BY_TYPE[file.type] ?? "jpg";
  const uuid = crypto.randomUUID();
  const path = `${folder}/${uuid}.${ext}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return { url: null, error: "사진 업로드에 실패했습니다. 다시 시도해주세요." };
  }

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(path);

  if (!publicUrlData?.publicUrl) {
    return { url: null, error: "사진 주소를 가져오지 못했습니다. 다시 시도해주세요." };
  }

  return { url: publicUrlData.publicUrl, error: null };
}
