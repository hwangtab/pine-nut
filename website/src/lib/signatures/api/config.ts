import { REGION_SUB_MAX_LENGTH } from "@/lib/regions";

export { REGION_SUB_MAX_LENGTH };

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX = 5;
export const MESSAGE_MAX_LENGTH = 500;
export const NAME_MAX_LENGTH = 50;
export const AFFILIATION_MAX_LENGTH = 60;
export const SIGNATURE_GOAL = 10000;
export const WALL_PAGE_SIZE = 30;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const SERVICE_UNAVAILABLE_MESSAGE =
  "서명 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
export const DUPLICATE_SIGNATURE_MESSAGE = "이미 서명하셨습니다. 참여해주셔서 감사합니다.";
export const RATE_LIMIT_MESSAGE = "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.";
export const INVALID_JSON_MESSAGE = "Invalid JSON";
export const INVALID_REGION_MESSAGE = "거주 지역을 선택해주세요.";
export const INVALID_NAME_PUBLIC_MESSAGE = "이름 공개 여부를 선택해주세요.";
export const FETCH_SIGNATURES_ERROR_MESSAGE = "Failed to fetch signatures";
export const SUBMIT_SIGNATURE_ERROR_MESSAGE = "Failed to submit signature";
