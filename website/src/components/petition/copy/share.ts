import type { PetitionShareEditField } from "./types";

export const koreanPetitionShareEditFields: PetitionShareEditField[] = [
  {
    contentKey: "petition.share.title",
    defaultValue: "우리가 나무다 — 풍천리 국민 연대서명",
    page: "petition",
    section: "share",
    buttonLabel: "공유 제목",
  },
  {
    contentKey: "petition.share.text",
    defaultValue: "홍천 풍천리 양수발전소 백지화를 위한 국민 연대서명에 함께해주세요.",
    page: "petition",
    section: "share",
    buttonLabel: "공유 설명",
    multiline: true,
  },
  {
    contentKey: "petition.share.copyFallback",
    defaultValue: "링크가 복사되었습니다.",
    page: "petition",
    section: "share",
    buttonLabel: "복사 알림",
  },
];
