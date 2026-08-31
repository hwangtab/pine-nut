import { REGION_SUB_MAX_LENGTH } from "@/lib/regions";

export { REGION_SUB_MAX_LENGTH };

// 서명 이메일(선택 필드) 형식 검사. 서버 검증(api/validation.ts)과 클라이언트
// 검증(lib/signatures/form.ts)이 각자 로컬 정규식을 복제해두면 한쪽만 고쳐질 때
// 조용히 어긋난다 — 이 상수 하나로 단일화한다.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX = 5;
export const MESSAGE_MAX_LENGTH = 500;
export const NAME_MAX_LENGTH = 50;
export const AFFILIATION_MAX_LENGTH = 60;
export const SIGNATURE_GOAL = 10000;
export const WALL_PAGE_SIZE = 30;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// 공개 조회(GET) 응답의 CDN 캐시 정책. 서명 현황·명단은 방문자마다 같은 값이라
// 방문자 수만큼 함수를 깨울 이유가 없다 — Vercel 엣지가 60초 동안 같은 응답을
// 함수 호출 없이 돌려주게 한다. 방문자가 분당 1만 명이어도 엔드포인트당 실제
// 호출은 분당 1회다.
//
// 60초를 고른 이유: 서명 수가 최대 1분 늦게 보이는 것은 청원 카운터에 무해한
// 반면, 방금 서명한 시민이 자기 이름을 명단에서 못 보는 것은 무해하지 않다.
// 그 경로(제출 직후 재조회)는 client.ts가 `fresh` 파라미터로 캐시를 우회한다.
//
// stale-while-revalidate: TTL이 끝난 뒤에도 10분 동안은 낡은 응답을 즉시 주면서
// 뒤에서 갱신한다 — 트래픽이 몰릴 때 만료 순간 요청이 한꺼번에 오리진으로
// 쏟아지는 것(cache stampede)을 막는다.
export const PUBLIC_READ_CACHE_SECONDS = 60;
export const PUBLIC_READ_CACHE_CONTROL = `public, s-maxage=${PUBLIC_READ_CACHE_SECONDS}, stale-while-revalidate=600`;

export const SERVICE_UNAVAILABLE_MESSAGE =
  "서명 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
export const DUPLICATE_SIGNATURE_MESSAGE = "이미 서명하셨습니다. 참여해주셔서 감사합니다.";
// 같은 이메일의 기존 서명을 고쳐 쓰려면 처음 서명할 때 쓴 이름과 같아야 한다
// (submit_signature RPC의 DO UPDATE ... WHERE). 남의 이메일만 알면 그 사람의
// 서명을 덮어쓸 수 있는 상태를 막기 위한 조건이라, 문구도 "이미 서명됨"이 아니라
// 무엇을 해야 하는지 알려주는 쪽으로 쓴다.
export const SIGNATURE_NAME_MISMATCH_MESSAGE =
  "이 이메일로 이미 서명이 접수돼 있습니다. 서명 내용을 고치시려면 처음 서명하실 때 쓰신 이름과 똑같이 입력해주세요.";
export const RATE_LIMIT_MESSAGE = "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.";
export const INVALID_JSON_MESSAGE = "잘못된 요청입니다. 다시 시도해주세요.";
export const INVALID_REGION_MESSAGE = "거주 지역을 선택해주세요.";
export const INVALID_NAME_PUBLIC_MESSAGE = "이름 공개 여부를 선택해주세요.";
export const FETCH_SIGNATURES_ERROR_MESSAGE = "서명 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
export const SUBMIT_SIGNATURE_ERROR_MESSAGE = "서명 제출에 실패했습니다. 잠시 후 다시 시도해주세요.";
export const FETCH_SIGNATURE_WALL_ERROR_MESSAGE =
  "명단을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
