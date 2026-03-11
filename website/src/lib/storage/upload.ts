import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

  if (!ALLOWED_TYPES.has(file.type)) {
    return { url: null, error: "JPG, PNG, WebP 형식의 사진만 올릴 수 있습니다." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: "사진 크기는 5MB 이하만 가능합니다." };
  }

  const ext = EXT_MAP[file.type] ?? "jpg";
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
