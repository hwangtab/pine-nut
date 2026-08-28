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

  const formSubmitFallbackError =
    getContent(copy.errors.submit.contentKey) ?? copy.errors.submit.defaultValue;

  // NOTE(Task 5 compile-keeping shim): regionTop/regionSub/affiliation/namePublic
  // have no input UI yet (that's Task 8's job) — until then they're fixed at
  // values that `validateSignatureForm` always rejects (empty region, null
  // namePublic), so the form cannot actually succeed. This keeps the 7-field
  // contract compiling without guessing at Task 8's field wiring.
  const buildValues = useCallback(
    (): SignatureFormValues => ({
      name,
      email,
      message,
      regionTop: "",
      regionSub: "",
      affiliation: "",
      namePublic: null,
      agreePrivacy,
      agreeAge,
    }),
    [agreeAge, agreePrivacy, email, message, name],
  );

  const validate = useCallback((): boolean => {
    const result = validateSignatureForm(buildValues());
    setErrors(result);
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

        // NOTE(Task 5 compile-keeping shim): the POST response no longer
        // carries a fresh count (contract shrank to `{ok:true}`). `count: 0`
        // is a placeholder — `onRefreshSignatures()` below re-fetches the
        // real summary immediately after, so any UI reading this value sees
        // it overwritten within one round trip. Task 8/12 owns wiring this
        // properly (e.g. dropping `count` from the callback entirely).
        onSubmitted({ name, count: 0 });
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
