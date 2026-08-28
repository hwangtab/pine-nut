"use client";

import PetitionFormText from "@/components/petition/PetitionFormText";
import type { PetitionSignatureFormCopy } from "@/components/petition/petition-copy";
import type { SignatureFormErrorKey } from "@/components/petition/signature-form/types";
import type { SignatureFormErrors } from "@/lib/signatures/form";

interface PetitionConsentFieldsProps {
  copy: PetitionSignatureFormCopy;
  agreePrivacy: boolean;
  agreeAge: boolean;
  errors: SignatureFormErrors;
  consentErrorId: string;
  showPrivacy: boolean;
  onConsentChange: (checked: boolean) => void;
  onTogglePrivacy: () => void;
  clearError: (key: SignatureFormErrorKey) => void;
}

export default function PetitionConsentFields({
  copy,
  agreePrivacy,
  agreeAge,
  errors,
  consentErrorId,
  showPrivacy,
  onConsentChange,
  onTogglePrivacy,
  clearError,
}: PetitionConsentFieldsProps) {
  // 화면에는 체크박스가 1개지만 DB는 consent_privacy·consent_age 두 컬럼을 모두
  // 요구한다. 한 번의 체크가 두 값을 함께 세팅하므로(setAgreeConsent), 표시
  // 상태도 둘이 모두 true일 때만 켜진 것으로 본다.
  const checked = agreePrivacy && agreeAge;
  const consentError = errors.agreePrivacy ?? errors.agreeAge;

  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer min-h-[48px]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => {
            onConsentChange(event.target.checked);
            if (errors.agreePrivacy) clearError("agreePrivacy");
            if (errors.agreeAge) clearError("agreeAge");
          }}
          aria-invalid={!!consentError}
          aria-describedby={consentError ? consentErrorId : undefined}
          className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
        />
        <span className="text-[15px] text-[var(--color-text)] leading-relaxed">
          {copy.labels.privacyPrefix && (
            <>
              <PetitionFormText copy={copy} text={copy.labels.privacyPrefix} />{" "}
            </>
          )}
          <button
            type="button"
            className="underline text-[var(--color-sky)] hover:text-[var(--color-sky)]/80"
            onClick={onTogglePrivacy}
            aria-expanded={showPrivacy}
          >
            <PetitionFormText copy={copy} text={copy.labels.privacyToggle} />
          </button>
          <PetitionFormText copy={copy} text={copy.labels.privacySuffix} />{" "}
          <PetitionFormText copy={copy} text={copy.labels.age} />{" "}
          <span className="text-[var(--color-warm)]">*</span>
        </span>
      </label>
      {showPrivacy && (
        <div className="ml-8 mt-2 p-4 bg-[var(--color-bg-warm)] rounded-xl text-sm text-[var(--color-text-muted)] leading-relaxed">
          {copy.privacyLines.map((line, index) => (
            <PetitionFormText
              key={line.contentKey}
              copy={copy}
              text={line}
              as="p"
              className={index < copy.privacyLines.length - 1 ? "mb-1" : ""}
            />
          ))}
        </div>
      )}
      {consentError && (
        <p id={consentErrorId} className="ml-8 mt-1 text-sm text-red-600" role="alert">
          {consentError}
        </p>
      )}
    </div>
  );
}
