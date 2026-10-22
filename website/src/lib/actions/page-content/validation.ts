import { validateEditableHref } from "@/lib/validation/editable-link";
import { validateOptionalImageUrl } from "@/lib/validation/url";
import {
  GLOBAL_LINK_SETS,
  parseBuilderLinks,
  validateBuilderLinks,
} from "@/lib/custom-sections/links";
import {
  parseCustomSections,
  validateCustomSections,
} from "@/lib/custom-sections/custom-section-data";
import type { ContentChange } from "@/lib/actions/page-content/types";

const KEY_PATTERN = /^[a-zA-Z0-9._-]+$/;

// 리스트 항목에서 이미지 URL로 취급할 필드명.
// 갤러리(gallery-data.ts photoFields)의 이미지 필드는 키가 그냥 "url"이라, 접두사를
// 요구하는 패턴만으로는 잡히지 않는다. "url" 단독도 포함시킨다.
// 링크용 필드(en 섹션의 "linkUrl")는 이미지가 아니므로 제외한다.
const IMAGE_FIELD_PATTERN =
  /^(url|(src|image|img|thumbnail|photo|cover)(_?url)?|.*_(image|img|photo|thumbnail|cover)(_?url)?)$/i;

// 리스트 항목에서 링크로 취급할 필드명(en 섹션 카드의 linkUrl 등). 비어 있으면 링크 없음으로 본다.
const LINK_FIELD_PATTERN = /^(href|linkUrl|link_url)$/;

const CUSTOM_SECTIONS_KEY_PATTERN = /^builder\.[a-zA-Z0-9_-]+\.customSections$/;
const BUILDER_LINK_KEYS = new Set<string>(Object.values(GLOBAL_LINK_SETS));

// 사이트 빌더가 저장 전에 클라이언트에서 돌리는 링크 검증을 서버에서도 그대로 다시 돌린다.
// 클라이언트 검증만 있으면 액션을 직접 호출해 "//evil.com" 같은 외부 링크를 넣을 수 있다.
function validateListLinks(contentKey: string, rawValue: string, items: unknown[]): string | null {
  if (BUILDER_LINK_KEYS.has(contentKey)) {
    return validateBuilderLinks(parseBuilderLinks(rawValue, []));
  }
  if (CUSTOM_SECTIONS_KEY_PATTERN.test(contentKey)) {
    return validateCustomSections(parseCustomSections(rawValue));
  }
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    for (const [field, value] of Object.entries(item as Record<string, unknown>)) {
      if (typeof value !== "string" || !value.trim()) continue;
      if (!LINK_FIELD_PATTERN.test(field)) continue;
      const validation = validateEditableHref(value, `${field} 링크 주소`);
      if (validation.error) return validation.error;
    }
  }
  return null;
}

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
    const linkError = validateListLinks(change.content_key, change.value, parsed);
    if (linkError) {
      return {
        row: change,
        error: `${change.content_key}: ${linkError}`,
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
