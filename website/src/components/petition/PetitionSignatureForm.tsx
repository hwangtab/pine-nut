"use client";

import {
  useCallback,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { Loader2, Send } from "lucide-react";
import { EditableText, EditableValue } from "@/components/editable";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { isValidEmail, submitSignature } from "@/lib/signatures/client";

interface PetitionSignatureFormProps {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmitted: (result: { name: string; count: number }) => void;
  onRefreshSignatures: () => void;
}

export default function PetitionSignatureForm({
  formRef,
  onSubmitted,
  onRefreshSignatures,
}: PetitionSignatureFormProps) {
  const { getContent, isEditMode } = useAdminEdit();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [signatureStartedTracked, setSignatureStartedTracked] = useState(false);

  const formNamePlaceholder = getContent("petition.form.namePlaceholder") ?? "홍길동";
  const formEmailPlaceholder =
    getContent("petition.form.emailPlaceholder") ?? "example@email.com";
  const formMessagePlaceholder =
    getContent("petition.form.messagePlaceholder") ?? "주민분들께 응원의 말씀을 남겨주세요";
  const formNameError =
    getContent("petition.form.errorName") ?? "이름을 입력해주세요.";
  const formEmailRequiredError =
    getContent("petition.form.errorEmailRequired") ?? "이메일을 입력해주세요.";
  const formEmailInvalidError =
    getContent("petition.form.errorEmailInvalid") ?? "올바른 이메일 형식을 입력해주세요.";
  const formPrivacyError =
    getContent("petition.form.errorPrivacy") ?? "개인정보 수집·이용에 동의해주세요.";
  const formAgeError =
    getContent("petition.form.errorAge") ?? "만 14세 이상 확인이 필요합니다.";
  const formSubmitFallbackError =
    getContent("petition.form.errorSubmit") ?? "서명 제출에 실패했습니다. 다시 시도해주세요.";

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = formNameError;
    }
    if (!email.trim()) {
      newErrors.email = formEmailRequiredError;
    } else if (!isValidEmail(email)) {
      newErrors.email = formEmailInvalidError;
    }
    if (!agreePrivacy) {
      newErrors.agreePrivacy = formPrivacyError;
    }
    if (!agreeAge) {
      newErrors.agreeAge = formAgeError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    const trimmedName = name.trim();

    try {
      const result = await submitSignature({
        name: trimmedName,
        email: email.trim(),
        message: message.trim(),
        agreePrivacy,
        agreeAge,
      });

      onSubmitted({ name: trimmedName, count: result.count });
      events.signatureComplete();
      onRefreshSignatures();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : formSubmitFallbackError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onFocusCapture={() => {
          if (!signatureStartedTracked) {
            events.signatureStart();
            setSignatureStartedTracked(true);
          }
        }}
        noValidate
        className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div>
          <label
            htmlFor="sig-name"
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            <EditableText
              contentKey="petition.form.nameLabel"
              defaultValue="이름"
              as="span"
              page="petition"
              section="form"
            />{" "}
            <span className="text-[var(--color-warm)]">*</span>
          </label>
          <input
            id="sig-name"
            type="text"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "sig-name-error" : undefined}
            placeholder={formNamePlaceholder}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)] transition"
          />
          {errors.name && (
            <p id="sig-name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sig-email"
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            <EditableText
              contentKey="petition.form.emailLabel"
              defaultValue="이메일"
              as="span"
              page="petition"
              section="form"
            />{" "}
            <span className="text-[var(--color-warm)]">*</span>
          </label>
          <input
            id="sig-email"
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "sig-email-error" : undefined}
            placeholder={formEmailPlaceholder}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)] transition"
          />
          {errors.email && (
            <p id="sig-email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sig-message"
            className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
          >
            <EditableText
              contentKey="petition.form.messageLabel"
              defaultValue="응원 메시지"
              as="span"
              page="petition"
              section="form"
            />{" "}
            <EditableText
              contentKey="petition.form.messageOptional"
              defaultValue="(선택)"
              as="span"
              page="petition"
              section="form"
              className="font-normal text-[var(--color-text-muted)]"
            />
          </label>
          <textarea
            id="sig-message"
            value={message}
            onChange={(event) => {
              if (event.target.value.length <= 100) setMessage(event.target.value);
            }}
            maxLength={100}
            rows={3}
            placeholder={formMessagePlaceholder}
            aria-describedby="sig-message-count"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)] resize-none transition"
          />
          <p
            id="sig-message-count"
            className="mt-1 text-right text-sm text-[var(--color-text-muted)]"
          >
            {message.length}/100
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(event) => {
                  setAgreePrivacy(event.target.checked);
                  if (errors.agreePrivacy)
                    setErrors((prev) => ({ ...prev, agreePrivacy: "" }));
                }}
                aria-invalid={!!errors.agreePrivacy}
                aria-describedby={errors.agreePrivacy ? "sig-privacy-error" : undefined}
                className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
              />
              <span className="text-[15px] text-[var(--color-text)]">
                <button
                  type="button"
                  className="underline text-[var(--color-sky)] hover:text-[var(--color-sky)]/80"
                  onClick={() => setShowPrivacy(!showPrivacy)}
                >
                  <EditableText
                    contentKey="petition.form.privacyToggle"
                    defaultValue="개인정보 수집·이용"
                    as="span"
                    page="petition"
                    section="form"
                  />
                </button>
                <EditableText
                  contentKey="petition.form.privacyConsentSuffix"
                  defaultValue="에 동의합니다."
                  as="span"
                  page="petition"
                  section="form"
                />{" "}
                <span className="text-[var(--color-warm)]">*</span>
              </span>
            </label>
            {showPrivacy && (
              <div className="ml-8 mt-2 p-4 bg-[var(--color-bg-warm)] rounded-xl text-sm text-[var(--color-text-muted)] leading-relaxed">
                <EditableText
                  contentKey="petition.form.privacyLine1"
                  defaultValue="수집 항목: 이름, 이메일"
                  as="p"
                  page="petition"
                  section="form"
                  className="mb-1"
                />
                <EditableText
                  contentKey="petition.form.privacyLine2"
                  defaultValue="수집 목적: 서명 확인 및 캠페인 안내"
                  as="p"
                  page="petition"
                  section="form"
                  className="mb-1"
                />
                <EditableText
                  contentKey="petition.form.privacyLine3"
                  defaultValue="보유 기간: 캠페인 종료 후 즉시 파기"
                  as="p"
                  page="petition"
                  section="form"
                  className="mb-1"
                />
                <EditableText
                  contentKey="petition.form.privacyLine4"
                  defaultValue="동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다."
                  as="p"
                  page="petition"
                  section="form"
                />
              </div>
            )}
            {errors.agreePrivacy && (
              <p
                id="sig-privacy-error"
                className="ml-8 mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.agreePrivacy}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={agreeAge}
                onChange={(event) => {
                  setAgreeAge(event.target.checked);
                  if (errors.agreeAge)
                    setErrors((prev) => ({ ...prev, agreeAge: "" }));
                }}
                aria-invalid={!!errors.agreeAge}
                aria-describedby={errors.agreeAge ? "sig-age-error" : undefined}
                className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
              />
              <span className="text-[15px] text-[var(--color-text)]">
                <EditableText
                  contentKey="petition.form.ageLabel"
                  defaultValue="만 14세 이상입니다."
                  as="span"
                  page="petition"
                  section="form"
                />{" "}
                <span className="text-[var(--color-warm)]">*</span>
              </span>
            </label>
            {errors.agreeAge && (
              <p
                id="sig-age-error"
                className="ml-8 mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.agreeAge}
              </p>
            )}
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[52px] rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <EditableText
                contentKey="petition.form.submitting"
                defaultValue="서명 중..."
                as="span"
                page="petition"
                section="form"
              />
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <EditableText
                contentKey="petition.form.submit"
                defaultValue="서명하기"
                as="span"
                page="petition"
                section="form"
              />
            </>
          )}
        </button>
      </form>

      {isEditMode && (
        <div className="mt-4 flex flex-wrap gap-2">
          <EditableValue
            contentKey="petition.form.namePlaceholder"
            defaultValue="홍길동"
            page="petition"
            section="form"
            buttonLabel="이름 힌트"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.emailPlaceholder"
            defaultValue="example@email.com"
            page="petition"
            section="form"
            buttonLabel="이메일 힌트"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.messagePlaceholder"
            defaultValue="주민분들께 응원의 말씀을 남겨주세요"
            page="petition"
            section="form"
            multiline
            buttonLabel="메시지 힌트"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.errorName"
            defaultValue="이름을 입력해주세요."
            page="petition"
            section="form"
            buttonLabel="이름 오류"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.errorEmailRequired"
            defaultValue="이메일을 입력해주세요."
            page="petition"
            section="form"
            buttonLabel="이메일 필수"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.errorEmailInvalid"
            defaultValue="올바른 이메일 형식을 입력해주세요."
            page="petition"
            section="form"
            buttonLabel="이메일 형식"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.errorPrivacy"
            defaultValue="개인정보 수집·이용에 동의해주세요."
            page="petition"
            section="form"
            buttonLabel="개인정보 오류"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.errorAge"
            defaultValue="만 14세 이상 확인이 필요합니다."
            page="petition"
            section="form"
            buttonLabel="연령 오류"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.form.errorSubmit"
            defaultValue="서명 제출에 실패했습니다. 다시 시도해주세요."
            page="petition"
            section="form"
            buttonLabel="제출 오류"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
        </div>
      )}
    </>
  );
}
