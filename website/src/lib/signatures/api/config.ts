export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX = 5;
export const MESSAGE_MAX_LENGTH = 100;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const SERVICE_UNAVAILABLE_MESSAGE =
  "서명 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
export const DUPLICATE_SIGNATURE_MESSAGE = "이미 서명하셨습니다. 참여해주셔서 감사합니다.";
export const RATE_LIMIT_MESSAGE = "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.";
export const INVALID_JSON_MESSAGE = "Invalid JSON";
export const FETCH_SIGNATURES_ERROR_MESSAGE = "Failed to fetch signatures";
export const SUBMIT_SIGNATURE_ERROR_MESSAGE = "Failed to submit signature";
