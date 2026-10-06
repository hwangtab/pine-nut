// 목자르기(10/10) 카풀 차량 — 기획팀 시트의 '탑승가능' 칸 수가 빈자리의 최종값이다.
// 차량 정보는 DB가 아니라 여기서 관리한다. 신청자만 carpool_riders 테이블에 쌓이고,
// 좌석 번호 범위(1..openSeats)는 API가 이 값으로 검증한다.
//
// 이 파일은 클라이언트 번들에도 실린다. 기존 탑승자는 이름만 두고 연락처는 넣지 않는다.

export interface CarpoolVehicle {
  id: string;
  name: string;
  departurePlace: string;
  /** null이면 "추후 안내" */
  departureTime: string | null;
  /** 이미 타기로 한 사람(운전자 포함) — 차량 카드에 이름으로 보여준다 */
  boarded: string[];
  /** 신청받는 빈자리 수 */
  openSeats: number;
  sameDayReturn: boolean;
}

export const CARPOOL_DATE_LABEL = "10월 10일(토)";
export const CARPOOL_RETURN_LABEL = "다음 날 10월 11일(일) 오전 11시 풍천리 출발";
export const CARPOOL_SAME_DAY_RETURN_LABEL = "공연 마치고 당일 귀환";

/** 신청 변경·취소 문의 */
export const CARPOOL_CONTACT_NAME = "황경하";
export const CARPOOL_CONTACT_PHONE = "010-4255-7893";

/** 이 시각 이후로는 신청을 받지 않는다(첫 차 출발 시각) */
export const CARPOOL_CLOSE_AT = new Date("2026-10-10T08:00:00+09:00");

export const CARPOOL_VEHICLES: CarpoolVehicle[] = [
  {
    id: "chotbul",
    name: "촛불교회 차량",
    departurePlace: "광화문",
    departureTime: "오전 9시",
    boarded: ["삼각전파사", "황경하", "정정훈"],
    openSeats: 5,
    sameDayReturn: false,
  },
  {
    id: "parkjihwi",
    name: "박지휘님 차량",
    departurePlace: "강변역",
    departureTime: "오전 9시",
    boarded: ["박지휘", "달위의 콜린스"],
    openSeats: 3,
    sameDayReturn: false,
  },
  {
    id: "dulgama",
    name: "둠가마",
    departurePlace: "강변역",
    departureTime: "오전 8시",
    boarded: ["사바하", "곽민", "관객 1인"],
    openSeats: 3,
    sameDayReturn: false,
  },
  {
    id: "youngjun",
    name: "영준카",
    departurePlace: "강변역",
    departureTime: "오전 8시",
    boarded: ["김영준"],
    openSeats: 4,
    sameDayReturn: false,
  },
  {
    id: "chichi",
    name: "치치카",
    departurePlace: "불광역",
    departureTime: "오전 9시",
    boarded: ["치치", "VAN KIDEN"],
    openSeats: 3,
    sameDayReturn: true,
  },
  {
    id: "chaae",
    name: "차애카",
    departurePlace: "뚝섬역",
    departureTime: "오전 9시",
    boarded: ["양차애", "DJ 스탑원", "DJ 괄"],
    openSeats: 4,
    sameDayReturn: true,
  },
];

const compactName = (name: string) => name.replace(/\s+/g, "").toLowerCase();

/** 시트에 이미 이름이 올라 있는 사람이면 그 차량 */
export function findBoardedVehicle(name: string): CarpoolVehicle | undefined {
  const target = compactName(name);
  return CARPOOL_VEHICLES.find((vehicle) =>
    vehicle.boarded.some((boardedName) => compactName(boardedName) === target),
  );
}

export function findCarpoolVehicle(id: string): CarpoolVehicle | undefined {
  return CARPOOL_VEHICLES.find((vehicle) => vehicle.id === id);
}

/** 숫자만 남긴 휴대전화 번호. 형식이 틀리면 null */
export function normalizeCarpoolPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return /^01[016789]\d{7,8}$/.test(digits) ? digits : null;
}

export function formatCarpoolPhone(digits: string): string {
  return digits.length === 11
    ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
