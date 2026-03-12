const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const SPECIAL_PROTOCOLS = new Set(["mailto:", "tel:"]);

export interface EditableHrefValidationResult {
  value: string | null;
  error: string | null;
}

export function isInternalEditableHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

export function isExternalEditableHref(href: string): boolean {
  return !isInternalEditableHref(href);
}

export function validateEditableHref(
  rawValue: string | null | undefined,
  fieldLabel: string,
): EditableHrefValidationResult {
  const value = rawValue?.trim() ?? "";

  if (!value) {
    return {
      value: null,
      error: `${fieldLabel}을(를) 입력해주세요.`,
    };
  }

  if (isInternalEditableHref(value)) {
    return { value, error: null };
  }

  try {
    const parsedUrl = new URL(value);

    if (
      !HTTP_PROTOCOLS.has(parsedUrl.protocol) &&
      !SPECIAL_PROTOCOLS.has(parsedUrl.protocol)
    ) {
      return {
        value: null,
        error: `${fieldLabel}은(는) 웹 주소, 메일, 전화 링크만 사용할 수 있습니다.`,
      };
    }

    return { value: parsedUrl.toString(), error: null };
  } catch {
    return {
      value: null,
      error: `${fieldLabel} 형식이 올바르지 않습니다.`,
    };
  }
}
