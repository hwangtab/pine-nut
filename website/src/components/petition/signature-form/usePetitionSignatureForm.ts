"use client";

import { useCallback, useState, type FormEvent } from "react";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import {
  submitSignatureForm,
  validateSignatureForm,
  type SignatureFormErrors,
  type SignatureFormValues,
} from "@/lib/signatures/form";
import type {
  PetitionSignatureFormProps,
  PetitionSignatureFormState,
  SignatureFormErrorKey,
} from "./types";

// Error keys `PetitionFormFields`/`PetitionConsentFields` actually render
// today. Kept as a named set (not inferred) so a future field-level UI
// change is a one-line change here, not a silent behavior shift.
// check-petition-signature-form-hook-refactor.mjs asserts this set matches
// SignatureFormErrors exactly, so a newly added error key fails the guard
// until its message has somewhere on screen to appear.
const RENDERED_ERROR_KEYS = new Set<keyof SignatureFormErrors>([
  "name",
  "email",
  "message",
  "region",
  "affiliation",
  "namePublic",
  "agreePrivacy",
  "agreeAge",
]);

export function usePetitionSignatureForm({
  copy,
  onSubmitted,
  onRefreshSignatures,
}: Required<Pick<PetitionSignatureFormProps, "copy" | "onSubmitted" | "onRefreshSignatures">>): PetitionSignatureFormState {
  const { getContent, isEditMode } = useAdminEdit();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [regionTop, setRegionTop] = useState("");
  const [regionSub, setRegionSub] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [namePublic, setNamePublic] = useState<boolean | null>(null);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<SignatureFormErrors>({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [signatureStartedTracked, setSignatureStartedTracked] = useState(false);

  // 동의 체크박스는 화면에 1개다. 문구가 성명서 취지 공감 + 개인정보 수집·이용 +
  // 만 14세 이상 확인을 한 문장으로 담고 있으므로, 한 번의 체크가 DB의 두 컬럼
  // (consent_privacy·consent_age)을 모두 채운다.
  const setAgreeConsent = useCallback((checked: boolean) => {
    setAgreePrivacy(checked);
    setAgreeAge(checked);
  }, []);

  const ids = {
    nameId: `${copy.fieldIdPrefix}-name`,
    emailId: `${copy.fieldIdPrefix}-email`,
    emailNoteId: `${copy.fieldIdPrefix}-email-note`,
    messageId: `${copy.fieldIdPrefix}-message`,
    messageCountId: `${copy.fieldIdPrefix}-message-count`,
    affiliationId: `${copy.fieldIdPrefix}-affiliation`,
    namePublicYesId: `${copy.fieldIdPrefix}-name-public-yes`,
    namePublicNoId: `${copy.fieldIdPrefix}-name-public-no`,
    namePublicNoteId: `${copy.fieldIdPrefix}-name-public-note`,
    namePublicErrorId: `${copy.fieldIdPrefix}-name-public-error`,
    consentErrorId: `${copy.fieldIdPrefix}-consent-error`,
  };

  const placeholders = {
    formNamePlaceholder:
      getContent(copy.placeholders.name.contentKey) ?? copy.placeholders.name.defaultValue,
    formEmailPlaceholder:
      getContent(copy.placeholders.email.contentKey) ?? copy.placeholders.email.defaultValue,
    formMessagePlaceholder:
      getContent(copy.placeholders.message.contentKey) ??
      copy.placeholders.message.defaultValue,
    formAffiliationPlaceholder:
      getContent(copy.placeholders.affiliationPlaceholder.contentKey) ??
      copy.placeholders.affiliationPlaceholder.defaultValue,
    regionTopPlaceholder:
      getContent(copy.placeholders.regionTopPlaceholder.contentKey) ??
      copy.placeholders.regionTopPlaceholder.defaultValue,
    regionSubPlaceholder:
      getContent(copy.placeholders.regionSubPlaceholder.contentKey) ??
      copy.placeholders.regionSubPlaceholder.defaultValue,
    overseasSubPlaceholder:
      getContent(copy.placeholders.overseasSubPlaceholder.contentKey) ??
      copy.placeholders.overseasSubPlaceholder.defaultValue,
  };

  const formSubmitFallbackError =
    getContent(copy.errors.submit.contentKey) ?? copy.errors.submit.defaultValue;

  const buildValues = useCallback(
    (): SignatureFormValues => ({
      name,
      email,
      message,
      regionTop,
      regionSub,
      affiliation,
      namePublic,
      agreePrivacy,
      agreeAge,
    }),
    [
      affiliation,
      agreeAge,
      agreePrivacy,
      email,
      message,
      name,
      namePublic,
      regionSub,
      regionTop,
    ],
  );

  const validate = useCallback((): boolean => {
    const result = validateSignatureForm(buildValues());
    setErrors(result);

    // 모든 오류 키는 지금 각 필드 옆에 렌더된다(RENDERED_ERROR_KEYS 참고).
    // 그래도 이 폴백은 남긴다 — 나중에 어떤 필드의 오류 렌더가 사라지면 그
    // 거부가 조용히 아무 반응 없는 제출 버튼으로 나타나기 때문이다. 그때는
    // 최소한 폼 상단 배너로 이유가 보인다.
    const unrenderedKeys = (Object.keys(result) as (keyof SignatureFormErrors)[]).filter(
      (key) => !RENDERED_ERROR_KEYS.has(key),
    );
    setSubmitError(
      unrenderedKeys.length > 0
        ? unrenderedKeys.map((key) => result[key]).join(" ")
        : "",
    );

    return Object.keys(result).length === 0;
  }, [buildValues]);

  const clearError = useCallback((key: SignatureFormErrorKey) => {
    setErrors((current) => {
      if (!current[key]) return current;

      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!validate()) return;

      setSubmitting(true);
      setSubmitError("");

      try {
        const result = await submitSignatureForm(buildValues());

        if (!result.ok) {
          setSubmitError(result.error || formSubmitFallbackError);
          return;
        }

        // POST 응답은 갱신된 카운트를 싣지 않는다(계약이 `{ok:true}`로
        // 줄었다). 그래서 이 콜백은 이름만 넘기고, 성공 화면이 보여줄 실제
        // 서명 수는 바로 아래 onRefreshSignatures()가 다시 불러온 요약
        // (usePetitionSignatureSummary의 summary.count)에서 나온다.
        // 서버는 name.trim()을 저장한다(api/validation.ts). 여기서 trim 전
        // 값을 넘기면 앞뒤 공백을 넣은 사람이 성공 화면과 명단 벽에서 서로
        // 다른 이름을 보게 된다.
        // mode를 함께 넘긴다 — 같은 이메일로 다시 서명한 경우(mode === "updated")
        // 총 서명 수는 그대로이므로 성공 화면이 "N번째로 함께해주셨습니다"를
        // 띄우면 사실과 다르다.
        onSubmitted({ name: name.trim(), mode: result.mode });
        events.signatureComplete();
        onRefreshSignatures();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : formSubmitFallbackError);
      } finally {
        setSubmitting(false);
      }
    },
    [buildValues, formSubmitFallbackError, name, onRefreshSignatures, onSubmitted, validate],
  );

  const handleFocusCapture = useCallback(() => {
    if (signatureStartedTracked) return;
    events.signatureStart();
    setSignatureStartedTracked(true);
  }, [signatureStartedTracked]);

  // copy.errors used to also carry name/emailRequired/emailInvalid/privacy/age
  // because the old validateSignatureForm read those messages from copy at
  // validation time. It no longer does — src/lib/signatures/form.ts now owns
  // fixed Korean copy for those errors — so those constants were dead copy and
  // have been removed from copy/form.ts entirely. Only copy.errors.submit
  // remains (read above as formSubmitFallbackError). Labels and notes stay
  // inline-editable through PetitionFormText, so only the value-type copy
  // needs a chip here.
  const editFields = [
    copy.placeholders.name,
    copy.placeholders.email,
    copy.placeholders.message,
    copy.placeholders.affiliationPlaceholder,
    copy.placeholders.regionTopPlaceholder,
    copy.placeholders.regionSubPlaceholder,
    copy.placeholders.overseasSubPlaceholder,
    copy.errors.submit,
  ];

  return {
    isEditMode,
    submitting,
    submitError,
    name,
    email,
    message,
    regionTop,
    regionSub,
    affiliation,
    namePublic,
    agreePrivacy,
    agreeAge,
    errors,
    showPrivacy,
    ids,
    placeholders,
    editFields,
    handleSubmit,
    handleFocusCapture,
    setName,
    setEmail,
    setMessage,
    setRegionTop,
    setRegionSub,
    setAffiliation,
    setNamePublic,
    setAgreeConsent,
    togglePrivacy: () => setShowPrivacy((current) => !current),
    clearError,
  };
}
