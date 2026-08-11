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
  const [agreed, setAgreed] = useState(false);
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
  const consentError =
    getContent("home.cta.inlineErrorConsent") ??
    "개인정보 수집·이용과 만 14세 이상 여부에 동의해주세요.";

  const onNameChange = useCallback((value: string) => {
    setName(value);
    setError(null);
  }, []);

  const onEmailChange = useCallback((value: string) => {
    setEmail(value);
    setError(null);
  }, []);

  const onAgreedChange = useCallback((value: boolean) => {
    setAgreed(value);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      // 동의를 하드코딩해 보내면 개인정보 수집 동의와 만 14세 확인을 받지 않은 채
      // 서명이 저장된다. 체크박스 값을 그대로 싣고, 검증도 필수로 건다.
      const validation = validateSignatureForm(
        {
          name,
          email,
          agreePrivacy: agreed,
          agreeAge: agreed,
        },
        {
          name: nameError,
          emailRequired: emailError,
          emailInvalid: emailError,
          privacy: consentError,
          age: consentError,
        },
        { requirePrivacy: true, requireAge: true },
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
          agreePrivacy: agreed,
          agreeAge: agreed,
        });
        setSuccess(true);
        setName("");
        setEmail("");
        setAgreed(false);
        onSignatureCountChange(result.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : submitError);
      } finally {
        setSubmitting(false);
      }
    },
    [agreed, consentError, email, emailError, name, nameError, onSignatureCountChange, submitError],
  );

  return {
    name,
    email,
    agreed,
    onAgreedChange,
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
