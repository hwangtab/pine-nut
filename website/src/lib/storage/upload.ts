import type { SupabaseClient } from "@supabase/supabase-js";
import {
  IMAGE_EXT_BY_TYPE,
  sniffImageType,
  validateImageFile,
} from "@/lib/image-upload-limits";

export interface UploadResult {
  url: string | null;
  error: string | null;
  /** 업로드된 스토리지 경로. 후속 DB 저장이 실패하면 이 경로를 지워 고아 파일을 막는다. */
  path?: string;
}

/** 업로드했다가 후속 처리가 실패했을 때 파일을 되돌린다. */
export async function removeUploadedImage(
  supabase: SupabaseClient,
  path: string | undefined,
): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from("images").remove([path]);
  if (error) console.error("removeUploadedImage failed:", path, error.message);
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

  // 선언된 MIME은 확장자에서 유추된 값이라 위조가 쉽다. 실제 바이트로 확인한다.
  // 단, 선언값과의 "완전 일치"를 요구하면 PNG를 .jpg로 이름만 바꾼 정상 이미지까지
  // 거부된다. 실제 형식이 허용 목록에 있으면 통과시키고, 저장은 실제 형식 기준으로 한다.
  const sniffed = await sniffImageType(file);
  if (!sniffed) {
    return { url: null, error: "이미지 파일이 아니거나 형식이 올바르지 않습니다." };
  }

  const ext = IMAGE_EXT_BY_TYPE[sniffed] ?? "jpg";
  const uuid = crypto.randomUUID();
  const path = `${folder}/${uuid}.${ext}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(path, file, { contentType: sniffed, upsert: false });

  if (error) {
    return { url: null, error: "사진 업로드에 실패했습니다. 다시 시도해주세요." };
  }

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(path);

  if (!publicUrlData?.publicUrl) {
    return { url: null, error: "사진 주소를 가져오지 못했습니다. 다시 시도해주세요." };
  }

  return { url: publicUrlData.publicUrl, error: null, path };
}
