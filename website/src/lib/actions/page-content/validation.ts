import { validateEditableHref } from "@/lib/validation/editable-link";
import { validateOptionalImageUrl } from "@/lib/validation/url";
import type { ContentChange } from "@/lib/actions/page-content/types";

const KEY_PATTERN = /^[a-zA-Z0-9._-]+$/;

// 리스트 항목에서 이미지 URL로 취급할 필드명(src, imageUrl, thumbnail, photo_url …)
const IMAGE_FIELD_PATTERN = /(^|_|\b)(src|image|img|thumbnail|photo|cover)(_?url)?$/i;

const MAX_TEXT_LENGTH = 2_000;
const MAX_RICHTEXT_LENGTH = 20_000;

const CONTENT_TYPES = new Set([
  "text",
  "richtext",
  "image",
  "list",
  "link",
  "section",
]);

export function validateContentKey(
  contentKey: string,
  message = `잘못된 content_key: ${contentKey}`,
): string | null {
  return KEY_PATTERN.test(contentKey) ? null : message;
}

function normalizeChange(change: ContentChange): { row: ContentChange; error: string | null } {
  if (!CONTENT_TYPES.has(change.content_type)) {
    return {
      row: change,
      error: `지원하지 않는 content_type: ${change.content_type}`,
    };
  }

  if (!change.page.trim()) {
    return {
      row: change,
      error: `page 값이 비어 있습니다: ${change.content_key}`,
    };
  }

  if (change.content_type === "image") {
    const validation = validateOptionalImageUrl(change.value, "이미지 URL");
    if (validation.error || !validation.value) {
      return {
        row: change,
        error: validation.error ?? `잘못된 이미지 URL: ${change.content_key}`,
      };
    }

    return {
      row: {
        ...change,
        value: validation.value,
      },
      error: null,
    };
  }

  if (change.content_type === "list") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(change.value);
    } catch {
      return {
        row: change,
        error: `리스트 값 JSON이 올바르지 않습니다: ${change.content_key}`,
      };
    }
    if (!Array.isArray(parsed)) {
      return {
        row: change,
        error: `리스트 값은 배열 JSON이어야 합니다: ${change.content_key}`,
      };
    }
    // 리스트 항목 안의 이미지 URL도 단일 image 값과 같은 규칙을 적용한다.
    // 여기서 거르지 않으면 허용되지 않은 호스트가 저장되고, 공개 페이지의
    // next/image가 런타임 에러를 내며 화면 전체가 죽는다.
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      for (const [field, value] of Object.entries(item as Record<string, unknown>)) {
        if (typeof value !== "string") continue;
        if (!IMAGE_FIELD_PATTERN.test(field)) continue;
        const validation = validateOptionalImageUrl(value, `${field} 이미지 URL`);
        if (validation.error) {
          return {
            row: change,
            error: `${change.content_key}: ${validation.error}`,
          };
        }
      }
    }
  }

  if (change.content_type === "link") {
    const validation = validateEditableHref(change.value, "링크 주소");
    if (validation.error || !validation.value) {
      return {
        row: change,
        error: validation.error ?? `잘못된 링크 주소: ${change.content_key}`,
      };
    }

    return {
      row: {
        ...change,
        value: validation.value,
      },
      error: null,
    };
  }

  if (
    change.content_type === "section" &&
    change.value !== "hidden" &&
    change.value !== "visible"
  ) {
    return {
      row: change,
      error: `섹션 값은 hidden 또는 visible 이어야 합니다: ${change.content_key}`,
    };
  }

  if (change.content_type === "text" || change.content_type === "richtext") {
    const trimmed = change.value.trim();
    // 빈 값을 저장하면 요소가 화면에서 사라지고, 그 뒤에는 클릭할 대상이 없어
    // 되돌리기조차 어렵다. 기본값으로 돌리려면 '되돌리기'를 쓰게 안내한다.
    if (!trimmed) {
      return {
        row: change,
        error: "빈 값은 저장할 수 없습니다. 기본 문구로 되돌리려면 '되돌리기'를 사용해주세요.",
      };
    }
    const limit = change.content_type === "text" ? MAX_TEXT_LENGTH : MAX_RICHTEXT_LENGTH;
    if (trimmed.length > limit) {
      return {
        row: change,
        error: `내용이 너무 깁니다. ${limit.toLocaleString()}자 이내로 입력해주세요.`,
      };
    }
    return { row: { ...change, value: trimmed }, error: null };
  }

  return { row: change, error: null };
}

export function normalizeContentChanges(
  changes: ContentChange[],
): { rows: ContentChange[]; error: string | null } {
  const rows: ContentChange[] = [];

  for (const change of changes) {
    const keyError = validateContentKey(change.content_key);
    if (keyError) return { rows, error: keyError };

    const normalized = normalizeChange(change);
    if (normalized.error) {
      return { rows, error: normalized.error };
    }
    rows.push(normalized.row);
  }

  return { rows, error: null };
}
