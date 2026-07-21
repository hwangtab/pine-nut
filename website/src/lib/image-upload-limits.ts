// 이미지 업로드 공통 제약. 클라이언트(파일 선택 즉시 안내)와 서버(최종 방어)가 함께 쓴다.
// "use server" 파일이 아니므로 상수/동기 함수를 그대로 export할 수 있고 양쪽에서 import 가능하다.

export const MAX_IMAGE_MB = 5;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ImageValidation = { ok: true } | { ok: false; error: string };

// 형식·용량을 검사하고 사람이 읽기 쉬운 안내 문구를 돌려준다(용량 초과 시 실제 파일 크기 표시).
export function validateImageFile(file: { size: number; type: string }): ImageValidation {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, error: "JPG, PNG, WebP 형식의 사진만 올릴 수 있습니다." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      error: `사진 크기는 ${MAX_IMAGE_MB}MB 이하만 가능합니다. (선택한 파일: ${mb}MB)`,
    };
  }
  return { ok: true };
}
