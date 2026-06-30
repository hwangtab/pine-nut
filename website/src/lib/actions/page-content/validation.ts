import { validateEditableHref } from "@/lib/validation/editable-link";
import { validateOptionalImageUrl } from "@/lib/validation/url";
import type { ContentChange } from "@/lib/actions/page-content/types";

const KEY_PATTERN = /^[a-zA-Z0-9._-]+$/;

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
    try {
      const parsed = JSON.parse(change.value);
      if (!Array.isArray(parsed)) {
        return {
          row: change,
          error: `리스트 값은 배열 JSON이어야 합니다: ${change.content_key}`,
        };
      }
    } catch {
      return {
        row: change,
        error: `리스트 값 JSON이 올바르지 않습니다: ${change.content_key}`,
      };
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
