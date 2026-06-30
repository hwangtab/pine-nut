"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import {
  submitSignatureForm,
  validateSignatureForm,
} from "@/lib/signatures/form";
import type {
  HomeInlineSignatureFormProps,
  HomeInlineSignatureState,
} from "./types";

export function useHomeInlineSignatureForm({
  onSignatureCountChange,
}: HomeInlineSignatureFormProps): HomeInlineSignatureState {
  const { getContent, isEditMode } = useAdminEdit();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const namePlaceholder = getContent("home.cta.inlineNamePlaceholder") ?? "이름";
  const emailPlaceholder = getContent("home.cta.inlineEmailPlaceholder") ?? "이메일";
  const nameError = getContent("home.cta.inlineErrorName") ?? "이름을 입력해주세요.";
  const emailError =
    getContent("home.cta.inlineErrorEmail") ?? "올바른 이메일 주소를 입력해주세요.";
  const submitError =
    getContent("home.cta.inlineErrorSubmit") ?? "서명에 실패했습니다. 다시 시도해주세요.";

  const onNameChange = useCallback((value: string) => {
    setName(value);
    setError(null);
  }, []);

  const onEmailChange = useCallback((value: string) => {
    setEmail(value);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const validation = validateSignatureForm(
        {
          name,
          email,
          agreePrivacy: true,
          agreeAge: true,
        },
        {
          name: nameError,
          emailRequired: emailError,
          emailInvalid: emailError,
          privacy: submitError,
          age: submitError,
        },
        { requirePrivacy: false, requireAge: false },
      );
      const firstError =
        validation.errors.name ??
        validation.errors.email ??
        validation.errors.agreePrivacy ??
        validation.errors.agreeAge;

      if (firstError) {
        setError(firstError);
        return;
      }

      setSubmitting(true);
      try {
        const result = await submitSignatureForm({
          name,
          email,
          agreePrivacy: true,
          agreeAge: true,
        });
        setSuccess(true);
        setName("");
        setEmail("");
        onSignatureCountChange(result.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : submitError);
      } finally {
        setSubmitting(false);
      }
    },
    [email, emailError, name, nameError, onSignatureCountChange, submitError],
  );

  return {
    name,
    email,
    namePlaceholder,
    emailPlaceholder,
    submitting,
    success,
    error,
    isEditMode,
    onNameChange,
    onEmailChange,
    handleSubmit,
  };
}
