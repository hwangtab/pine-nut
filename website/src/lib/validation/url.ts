import allowedImageHosts from "@/lib/allowed-image-hosts.json";

const ALLOWED_IMAGE_HOST_SET = new Set<string>(allowedImageHosts);
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export interface OptionalUrlValidationResult {
  value: string | null;
  error: string | null;
}

function parseOptionalHttpUrl(rawValue: string | null | undefined, fieldLabel: string): OptionalUrlValidationResult {
  const value = rawValue?.trim() ?? "";

  if (!value) {
    return { value: null, error: null };
  }

  try {
    const parsedUrl = new URL(value);
    if (!HTTP_PROTOCOLS.has(parsedUrl.protocol)) {
      return {
        value: null,
        error: `${fieldLabel}은(는) http 또는 https URL만 입력할 수 있습니다.`,
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

export function validateOptionalSourceUrl(rawValue: string | null | undefined): OptionalUrlValidationResult {
  return parseOptionalHttpUrl(rawValue, "출처 URL");
}

export function validateOptionalImageUrl(rawValue: string | null | undefined, fieldLabel: string): OptionalUrlValidationResult {
  const parsed = parseOptionalHttpUrl(rawValue, fieldLabel);
  if (parsed.error || !parsed.value) {
    return parsed;
  }

  const parsedUrl = new URL(parsed.value);
  if (parsedUrl.protocol !== "https:") {
    return {
      value: null,
      error: `${fieldLabel}은(는) https URL만 사용할 수 있습니다.`,
    };
  }

  if (!ALLOWED_IMAGE_HOST_SET.has(parsedUrl.hostname)) {
    return {
      value: null,
      error: `${fieldLabel}은(는) 허용된 이미지 도메인만 사용할 수 있습니다.`,
    };
  }

  return parsed;
}
