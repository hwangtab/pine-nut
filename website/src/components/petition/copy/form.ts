import type { PetitionSignatureFormCopy } from "./types";

export const koreanPetitionFormCopy: PetitionSignatureFormCopy = {
  page: "petition",
  fieldIdPrefix: "sig",
  labels: {
    name: { contentKey: "petition.form.nameLabel", defaultValue: "이름 또는 닉네임" },
    email: { contentKey: "petition.form.emailLabel", defaultValue: "이메일" },
    emailOptional: { contentKey: "petition.form.emailOptional", defaultValue: "(선택)" },
    emailNote: {
      contentKey: "petition.form.emailNote",
      defaultValue:
        "이후 풍천리 숲 보전 활동의 진행 상황과 결과를 받아보기를 원하시는 경우 입력해 주세요. 이메일은 활동 진행 상황 안내 목적으로만 사용합니다.",
    },
    message: { contentKey: "petition.form.messageLabel", defaultValue: "제안 한마디" },
    messageOptional: { contentKey: "petition.form.messageOptional", defaultValue: "(선택)" },
    regionLabel: { contentKey: "petition.form.regionLabel", defaultValue: "거주 지역" },
    affiliationLabel: {
      contentKey: "petition.form.affiliationLabel",
      defaultValue: "소속 단체 또는 모임",
    },
    namePublicLabel: {
      contentKey: "petition.form.namePublicLabel",
      defaultValue:
        "연대서명 참여자의 이름 또는 닉네임을 향후 성명서·서명 결과 발표 자료 등에 공개하는 것에 동의하시나요?",
    },
    namePublicYes: {
      contentKey: "petition.form.namePublicYes",
      defaultValue: "공개에 동의합니다",
    },
    namePublicNo: {
      contentKey: "petition.form.namePublicNo",
      defaultValue: "공개하지 않는 것에 동의합니다",
    },
    namePublicNote: {
      contentKey: "petition.form.namePublicNote",
      defaultValue:
        "공개에 동의하시면 이 페이지 하단 명단에 이름 또는 닉네임과 지역이 표시됩니다. 이름 또는 닉네임의 공개 여부와 연대서명 참여 여부는 별도로 선택할 수 있습니다.",
    },
    privacyPrefix: {
      contentKey: "petition.form.privacyPrefix",
      defaultValue:
        "본인은 「홍천 풍천리 양수발전소 건설 백지화와 풍천리 숲·계곡 보전을 촉구하는 성명서」의 취지에 공감하며 연대서명에 참여하고,",
    },
    privacyToggle: {
      contentKey: "petition.form.privacyToggle",
      defaultValue: "개인정보 수집·이용",
    },
    privacySuffix: {
      contentKey: "petition.form.privacyConsentSuffix",
      defaultValue: "에 동의합니다.",
    },
    age: { contentKey: "petition.form.ageLabel", defaultValue: "만 14세 이상임을 확인합니다." },
    submit: { contentKey: "petition.form.submit", defaultValue: "🌲 서명 동참하기" },
    submitting: { contentKey: "petition.form.submitting", defaultValue: "서명 중..." },
  },
  placeholders: {
    name: {
      contentKey: "petition.form.namePlaceholder",
      defaultValue: "홍길동",
      buttonLabel: "이름 힌트",
    },
    email: {
      contentKey: "petition.form.emailPlaceholder",
      defaultValue: "example@email.com",
      buttonLabel: "이메일 힌트",
    },
    message: {
      contentKey: "petition.form.messagePlaceholder",
      defaultValue:
        "정부와 한국수력원자력에 전하고 싶은, 풍천리의 숲과 계곡을 보전하며 지역과 국가가 함께할 수 있는 방법에 대한 생각을 남겨주세요",
      buttonLabel: "메시지 힌트",
      multiline: true,
    },
    affiliationPlaceholder: {
      contentKey: "petition.form.affiliationPlaceholder",
      defaultValue: "예: OO환경모임 (개인 자격으로 참여하시는 경우 비워두셔도 됩니다)",
      buttonLabel: "소속 힌트",
    },
    regionTopPlaceholder: {
      contentKey: "petition.form.regionTopPlaceholder",
      defaultValue: "시·도 선택",
      buttonLabel: "시·도 안내",
    },
    regionSubPlaceholder: {
      contentKey: "petition.form.regionSubPlaceholder",
      defaultValue: "시·군·구 선택",
      buttonLabel: "시·군·구 안내",
    },
    overseasSubPlaceholder: {
      contentKey: "petition.form.overseasSubPlaceholder",
      defaultValue: "예: 미국 로스앤젤레스",
      buttonLabel: "해외 거주지 안내",
    },
  },
  errors: {
    name: {
      contentKey: "petition.form.errorName",
      defaultValue: "이름을 입력해주세요.",
      buttonLabel: "이름 오류",
    },
    emailRequired: {
      contentKey: "petition.form.errorEmailRequired",
      defaultValue: "이메일을 입력해주세요.",
      buttonLabel: "이메일 필수",
    },
    emailInvalid: {
      contentKey: "petition.form.errorEmailInvalid",
      defaultValue: "올바른 이메일 형식을 입력해주세요.",
      buttonLabel: "이메일 형식",
    },
    privacy: {
      contentKey: "petition.form.errorPrivacy",
      defaultValue: "개인정보 수집·이용에 동의해주세요.",
      buttonLabel: "개인정보 오류",
    },
    age: {
      contentKey: "petition.form.errorAge",
      defaultValue: "만 14세 이상 확인이 필요합니다.",
      buttonLabel: "연령 오류",
    },
    submit: {
      contentKey: "petition.form.errorSubmit",
      defaultValue: "서명 제출에 실패했습니다. 다시 시도해주세요.",
      buttonLabel: "제출 오류",
    },
  },
  privacyLines: [
    {
      contentKey: "petition.form.privacyLine1",
      defaultValue: "수집 항목: 이름 또는 닉네임, 거주 지역, 이메일(선택), 소속 단체 또는 모임(선택)",
    },
    {
      contentKey: "petition.form.privacyLine2",
      defaultValue: "수집 목적: 연대서명 집계, 성명서·서명 결과 발표, 관련 공론화 활동",
    },
    {
      contentKey: "petition.form.privacyLine3",
      defaultValue:
        "이용 범위: 연대서명 및 관련 공론화 활동의 목적을 달성할 때까지 사용하며, 이후 즉시 파기합니다.",
    },
    {
      contentKey: "petition.form.privacyLine4",
      defaultValue: "동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다.",
    },
  ],
};
