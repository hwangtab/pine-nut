"use client";

import PetitionFormText from "@/components/petition/PetitionFormText";
import type { PetitionSignatureFormCopy } from "@/components/petition/petition-copy";
import type {
  SignatureFormErrorKey,
  SignatureFormErrors,
} from "@/lib/signatures/form";

interface PetitionConsentFieldsProps {
  copy: PetitionSignatureFormCopy;
  agreePrivacy: boolean;
  agreeAge: boolean;
  errors: SignatureFormErrors;
  privacyErrorId: string;
  ageErrorId: string;
  showPrivacy: boolean;
  onPrivacyChange: (checked: boolean) => void;
  onAgeChange: (checked: boolean) => void;
  onTogglePrivacy: () => void;
  clearError: (key: SignatureFormErrorKey) => void;
}

export default function PetitionConsentFields({
  copy,
  agreePrivacy,
  agreeAge,
  errors,
  privacyErrorId,
  ageErrorId,
  showPrivacy,
  onPrivacyChange,
  onAgeChange,
  onTogglePrivacy,
  clearError,
}: PetitionConsentFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(event) => {
              onPrivacyChange(event.target.checked);
              if (errors.agreePrivacy) clearError("agreePrivacy");
            }}
            aria-invalid={!!errors.agreePrivacy}
            aria-describedby={errors.agreePrivacy ? privacyErrorId : undefined}
            className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
          />
          <span className="text-[15px] text-[var(--color-text)]">
            {copy.labels.privacyPrefix && (
              <>
                <PetitionFormText copy={copy} text={copy.labels.privacyPrefix} />{" "}
              </>
            )}
            <button
              type="button"
              className="underline text-[var(--color-sky)] hover:text-[var(--color-sky)]/80"
              onClick={onTogglePrivacy}
            >
              <PetitionFormText copy={copy} text={copy.labels.privacyToggle} />
            </button>
            <PetitionFormText copy={copy} text={copy.labels.privacySuffix} />{" "}
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
        {errors.agreePrivacy && (
          <p id={privacyErrorId} className="ml-8 mt-1 text-sm text-red-600" role="alert">
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
              onAgeChange(event.target.checked);
              if (errors.agreeAge) clearError("agreeAge");
            }}
            aria-invalid={!!errors.agreeAge}
            aria-describedby={errors.agreeAge ? ageErrorId : undefined}
            className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
          />
          <span className="text-[15px] text-[var(--color-text)]">
            <PetitionFormText copy={copy} text={copy.labels.age} />{" "}
            <span className="text-[var(--color-warm)]">*</span>
          </span>
        </label>
        {errors.agreeAge && (
          <p id={ageErrorId} className="ml-8 mt-1 text-sm text-red-600" role="alert">
            {errors.agreeAge}
          </p>
        )}
      </div>
    </div>
  );
}
