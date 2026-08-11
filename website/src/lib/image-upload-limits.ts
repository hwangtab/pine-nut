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

/**
 * 파일 앞부분 바이트로 실제 이미지 형식을 판정한다.
 * file.type은 브라우저가 확장자를 보고 붙인 값이라, 확장자만 .jpg로 바꾼
 * 실행 파일도 "image/jpeg"로 선언된다. 저장 전에 실제 내용을 확인한다.
 * 판정할 수 없으면 null.
 */
export async function sniffImageType(
  file: Blob,
): Promise<(typeof ALLOWED_IMAGE_TYPES)[number] | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (head.length < 12) return null;

  // JPEG: FF D8 FF
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, i) => head[i] === byte)) return "image/png";
  // WebP: "RIFF" .... "WEBP"
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...head.slice(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";

  return null;
}

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
