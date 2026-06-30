import type { PetitionSignatureFormCopy } from "./types";

export const koreanPetitionFormCopy: PetitionSignatureFormCopy = {
  page: "petition",
  fieldIdPrefix: "sig",
  labels: {
    name: { contentKey: "petition.form.nameLabel", defaultValue: "이름" },
    email: { contentKey: "petition.form.emailLabel", defaultValue: "이메일" },
    message: { contentKey: "petition.form.messageLabel", defaultValue: "응원 메시지" },
    messageOptional: { contentKey: "petition.form.messageOptional", defaultValue: "(선택)" },
    privacyToggle: {
      contentKey: "petition.form.privacyToggle",
      defaultValue: "개인정보 수집·이용",
    },
    privacySuffix: {
      contentKey: "petition.form.privacyConsentSuffix",
      defaultValue: "에 동의합니다.",
    },
    age: { contentKey: "petition.form.ageLabel", defaultValue: "만 14세 이상입니다." },
    submit: { contentKey: "petition.form.submit", defaultValue: "서명하기" },
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
      defaultValue: "주민분들께 응원의 말씀을 남겨주세요",
      buttonLabel: "메시지 힌트",
      multiline: true,
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
    { contentKey: "petition.form.privacyLine1", defaultValue: "수집 항목: 이름, 이메일" },
    {
      contentKey: "petition.form.privacyLine2",
      defaultValue: "수집 목적: 서명 확인 및 캠페인 안내",
    },
    {
      contentKey: "petition.form.privacyLine3",
      defaultValue: "보유 기간: 캠페인 종료 후 즉시 파기",
    },
    {
      contentKey: "petition.form.privacyLine4",
      defaultValue: "동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다.",
    },
  ],
};

export const englishPetitionFormCopy: PetitionSignatureFormCopy = {
  page: "en/petition",
  fieldIdPrefix: "en-sig",
  labels: {
    name: { contentKey: "en.petition.form.nameLabel", defaultValue: "Name" },
    email: { contentKey: "en.petition.form.emailLabel", defaultValue: "Email" },
    message: {
      contentKey: "en.petition.form.messageLabel",
      defaultValue: "Message of support",
    },
    messageOptional: {
      contentKey: "en.petition.form.messageOptional",
      defaultValue: "(optional)",
    },
    privacyPrefix: {
      contentKey: "en.petition.form.privacyPrefix",
      defaultValue: "I agree to the",
    },
    privacyToggle: {
      contentKey: "en.petition.form.privacyToggle",
      defaultValue: "privacy notice",
    },
    privacySuffix: { contentKey: "en.petition.form.privacySuffix", defaultValue: "." },
    age: {
      contentKey: "en.petition.form.ageLabel",
      defaultValue: "I confirm that I am at least 14 years old.",
    },
    submit: { contentKey: "en.petition.form.submit", defaultValue: "Sign the petition" },
    submitting: { contentKey: "en.petition.form.submitting", defaultValue: "Submitting..." },
  },
  placeholders: {
    name: {
      contentKey: "en.petition.form.namePlaceholder",
      defaultValue: "Your name",
      buttonLabel: "Name hint",
    },
    email: {
      contentKey: "en.petition.form.emailPlaceholder",
      defaultValue: "name@example.com",
      buttonLabel: "Email hint",
    },
    message: {
      contentKey: "en.petition.form.messagePlaceholder",
      defaultValue: "Leave a short message for the residents",
      buttonLabel: "Message hint",
      multiline: true,
    },
  },
  errors: {
    name: {
      contentKey: "en.petition.form.errorName",
      defaultValue: "Please enter your name.",
      buttonLabel: "Name error",
    },
    emailRequired: {
      contentKey: "en.petition.form.errorEmailRequired",
      defaultValue: "Please enter your email address.",
      buttonLabel: "Email required",
    },
    emailInvalid: {
      contentKey: "en.petition.form.errorEmailInvalid",
      defaultValue: "Please enter a valid email address.",
      buttonLabel: "Email invalid",
    },
    privacy: {
      contentKey: "en.petition.form.errorPrivacy",
      defaultValue: "Please agree to the privacy notice.",
      buttonLabel: "Privacy error",
    },
    age: {
      contentKey: "en.petition.form.errorAge",
      defaultValue: "You must confirm that you are at least 14 years old.",
      buttonLabel: "Age error",
    },
    submit: {
      contentKey: "en.petition.form.errorSubmit",
      defaultValue: "Failed to submit signature.",
      buttonLabel: "Submit error",
    },
  },
  privacyLines: [
    {
      contentKey: "en.petition.form.privacyLine1",
      defaultValue: "Data collected: name and email",
    },
    {
      contentKey: "en.petition.form.privacyLine2",
      defaultValue: "Purpose: petition verification and campaign updates",
    },
    {
      contentKey: "en.petition.form.privacyLine3",
      defaultValue: "Retention: deleted after the campaign ends",
    },
  ],
};
