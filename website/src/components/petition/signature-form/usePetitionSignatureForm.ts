"use client";

import { useCallback, useState, type FormEvent } from "react";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import {
  submitSignatureForm,
  validateSignatureForm,
  type SignatureFormErrorKey,
  type SignatureFormErrors,
} from "@/lib/signatures/form";
import type {
  PetitionSignatureFormProps,
  PetitionSignatureFormState,
} from "./types";

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
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<SignatureFormErrors>({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [signatureStartedTracked, setSignatureStartedTracked] = useState(false);

  const ids = {
    nameId: `${copy.fieldIdPrefix}-name`,
    emailId: `${copy.fieldIdPrefix}-email`,
    messageId: `${copy.fieldIdPrefix}-message`,
    messageCountId: `${copy.fieldIdPrefix}-message-count`,
    privacyErrorId: `${copy.fieldIdPrefix}-privacy-error`,
    ageErrorId: `${copy.fieldIdPrefix}-age-error`,
  };

  const placeholders = {
    formNamePlaceholder:
      getContent(copy.placeholders.name.contentKey) ?? copy.placeholders.name.defaultValue,
    formEmailPlaceholder:
      getContent(copy.placeholders.email.contentKey) ?? copy.placeholders.email.defaultValue,
    formMessagePlaceholder:
      getContent(copy.placeholders.message.contentKey) ??
      copy.placeholders.message.defaultValue,
  };

  const formNameError =
    getContent(copy.errors.name.contentKey) ?? copy.errors.name.defaultValue;
  const formEmailRequiredError =
    getContent(copy.errors.emailRequired.contentKey) ??
    copy.errors.emailRequired.defaultValue;
  const formEmailInvalidError =
    getContent(copy.errors.emailInvalid.contentKey) ?? copy.errors.emailInvalid.defaultValue;
  const formPrivacyError =
    getContent(copy.errors.privacy.contentKey) ?? copy.errors.privacy.defaultValue;
  const formAgeError =
    getContent(copy.errors.age.contentKey) ?? copy.errors.age.defaultValue;
  const formSubmitFallbackError =
    getContent(copy.errors.submit.contentKey) ?? copy.errors.submit.defaultValue;

  const validate = useCallback((): boolean => {
    const result = validateSignatureForm(
      { name, email, agreePrivacy, agreeAge },
      {
        name: formNameError,
        emailRequired: formEmailRequiredError,
        emailInvalid: formEmailInvalidError,
        privacy: formPrivacyError,
        age: formAgeError,
      },
    );

    setErrors(result.errors);
    return result.valid;
  }, [
    agreeAge,
    agreePrivacy,
    email,
    formAgeError,
    formEmailInvalidError,
    formEmailRequiredError,
    formNameError,
    formPrivacyError,
    name,
  ]);

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
        const result = await submitSignatureForm({
          name,
          email,
          message,
          agreePrivacy,
          agreeAge,
        });

        onSubmitted({ name: result.name, count: result.count });
        events.signatureComplete();
        onRefreshSignatures();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : formSubmitFallbackError);
      } finally {
        setSubmitting(false);
      }
    },
    [
      agreeAge,
      agreePrivacy,
      email,
      formSubmitFallbackError,
      message,
      name,
      onRefreshSignatures,
      onSubmitted,
      validate,
    ],
  );

  const handleFocusCapture = useCallback(() => {
    if (signatureStartedTracked) return;
    events.signatureStart();
    setSignatureStartedTracked(true);
  }, [signatureStartedTracked]);

  const editFields = [
    copy.placeholders.name,
    copy.placeholders.email,
    copy.placeholders.message,
    copy.errors.name,
    copy.errors.emailRequired,
    copy.errors.emailInvalid,
    copy.errors.privacy,
    copy.errors.age,
    copy.errors.submit,
  ];

  return {
    isEditMode,
    submitting,
    submitError,
    name,
    email,
    message,
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
    setAgreePrivacy,
    setAgreeAge,
    togglePrivacy: () => setShowPrivacy((current) => !current),
    clearError,
  };
}
