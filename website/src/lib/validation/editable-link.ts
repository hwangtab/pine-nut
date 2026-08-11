const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const SPECIAL_PROTOCOLS = new Set(["mailto:", "tel:"]);

export interface EditableHrefValidationResult {
  value: string | null;
  error: string | null;
}

export function isInternalEditableHref(href: string): boolean {
  if (href.startsWith("#")) return true;
  if (!href.startsWith("/")) return false;
  // "//evil.com"은 프로토콜 상대 URL이라 브라우저가 외부 사이트로 이동시킨다.
  // "/\evil.com"도 일부 브라우저가 "//"로 해석한다. 둘 다 내부 경로가 아니다.
  return !href.startsWith("//") && !href.startsWith("/\\");
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
