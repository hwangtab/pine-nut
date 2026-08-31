import type { PetitionShareEditField } from "./types";

/**
 * 공유 문구의 기본값. `/petition` 페이지의 폴백(관리자가 CMS에서 값을 덮어쓰지
 * 않았을 때)과 아래 CMS 편집 칩이 같은 문자열을 봐야 한다 — 페이지가 자기
 * 리터럴을 따로 들고 있으면 관리자가 편집 칩에서 보는 "현재 기본값"과 실제로
 * 화면에 나가는 문구가 조용히 어긋난다.
 */
export const koreanPetitionShareDefaults = {
  title: "우리가 나무다 — 풍천리 연대서명",
  text: "홍천 풍천리 양수발전소 백지화를 위한 연대서명에 함께해주세요.",
  copyFallback: "링크가 복사되었습니다.",
} as const;

export const koreanPetitionShareEditFields: PetitionShareEditField[] = [
  {
    contentKey: "petition.share.title",
    defaultValue: koreanPetitionShareDefaults.title,
    page: "petition",
    section: "share",
    buttonLabel: "공유 제목",
  },
  {
    contentKey: "petition.share.text",
    defaultValue: koreanPetitionShareDefaults.text,
    page: "petition",
    section: "share",
    buttonLabel: "공유 설명",
    multiline: true,
  },
  {
    contentKey: "petition.share.copyFallback",
    defaultValue: koreanPetitionShareDefaults.copyFallback,
    page: "petition",
    section: "share",
    buttonLabel: "복사 알림",
  },
];
