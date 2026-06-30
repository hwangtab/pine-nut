import type { PetitionShareEditField } from "./types";

export const koreanPetitionShareEditFields: PetitionShareEditField[] = [
  {
    contentKey: "petition.share.title",
    defaultValue: "풍천리를 지켜주세요",
    page: "petition",
    section: "share",
    buttonLabel: "공유 제목",
  },
  {
    contentKey: "petition.share.text",
    defaultValue: "풍천리 주민들의 양수발전소 건설 반대 서명에 함께해주세요!",
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

export const englishPetitionShareEditFields: PetitionShareEditField[] = [
  {
    contentKey: "en.petition.share.title",
    defaultValue: "Save Pungcheon-ri",
    page: "en/petition",
    section: "share",
    buttonLabel: "Share title",
  },
  {
    contentKey: "en.petition.share.text",
    defaultValue: "Stand with residents of Pungcheon-ri and sign the petition.",
    page: "en/petition",
    section: "share",
    buttonLabel: "Share text",
    multiline: true,
  },
];
