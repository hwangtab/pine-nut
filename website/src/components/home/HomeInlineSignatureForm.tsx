"use client";

import { FadeIn } from "@/components/home/HomeMotion";
import { HomeInlineSignatureEditControls } from "@/components/home/inline-signature/HomeInlineSignatureEditControls";
import { HomeInlineSignatureFields } from "@/components/home/inline-signature/HomeInlineSignatureFields";
import { HomeInlineSignaturePrivacyNotice } from "@/components/home/inline-signature/HomeInlineSignaturePrivacyNotice";
import { HomeInlineSignatureSuccess } from "@/components/home/inline-signature/HomeInlineSignatureSuccess";
import type { HomeInlineSignatureFormProps } from "@/components/home/inline-signature/types";
import { useHomeInlineSignatureForm } from "@/components/home/inline-signature/useHomeInlineSignatureForm";

export default function HomeInlineSignatureForm({
  onSignatureCountChange,
}: HomeInlineSignatureFormProps) {
  const {
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
  } = useHomeInlineSignatureForm({ onSignatureCountChange });

  return (
    <FadeIn className="mb-12">
      <div className="max-w-2xl mx-auto rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-white p-6 shadow-card sm:p-8">
        {success ? (
          <HomeInlineSignatureSuccess />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <HomeInlineSignatureFields
              name={name}
              email={email}
              namePlaceholder={namePlaceholder}
              emailPlaceholder={emailPlaceholder}
              submitting={submitting}
              error={error}
              onNameChange={onNameChange}
              onEmailChange={onEmailChange}
            />
            {error && (
              <p id="inline-signature-error" className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}
            <HomeInlineSignaturePrivacyNotice />
            {isEditMode && <HomeInlineSignatureEditControls />}
          </form>
        )}
      </div>
    </FadeIn>
  );
}
